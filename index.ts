import express, { Application, NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const app: Application = express();
const PORT = 4000;

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Prisma Operations" });
});

app.get("/users", async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: {
      isDeleted: false,
    },
  });
  res.json(users);
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = error instanceof Error ? error.message : "Internal server error";
  res.status(500).json({ message });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
