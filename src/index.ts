import express, { Application } from "express";
import userRoutes from "./routes/user.routes";

const app: Application = express();
const PORT = 4000;

app.use(express.json());
app.use("/users", userRoutes);

app.get("/", (_req, res) => res.json({ message: "Prisma Operations" }));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
