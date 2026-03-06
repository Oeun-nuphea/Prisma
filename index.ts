import express, { Application, NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const app: Application = express();
const PORT = 4000;

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

console.log("Prisma connected"); // 👈 add this

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Prisma Operations" });
});

app.get("/users", async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      name: true,
      email: true,
      // just don't include isDeleted
    },
  });
  res.json(users);
});

app.get("/users/:id", async (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      // just don't include isDeleted
    },
  });
  res.json(user);
})

app.post("/users", async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    if (!name || !email)
      res.status(409).json({ message: "Email and Name are required" });

    const existedEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existedEmail) res.status(409).json({ message: "Email already exists" });

    const user = await prisma.user.create({
      data: { name, email },
    });

    res.json(user);
  } catch (error) {
    console.log(error);
  }
});

// update
app.patch("/users/:id", async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const { name, email } = req.body;

    const existedEmail = email
      ? await prisma.user.findUnique({
          where: { email },
        })
      : null;

    if (existedEmail && existedEmail.id !== id) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.patch("/users/:id/delete", async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const deletedUser = await prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json(deletedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
