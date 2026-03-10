import express, { Application } from "express";
import user from "./routes/user.routes";
import note from "./routes/note.routes";
import admin from "./routes/admin.routes";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();

const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(helmet());

app.use(express.json());
app.use("/users", user);
app.use("/notes", note);
app.use("/admin", admin);

app.get("/", (_req, res) => res.json({ message: "Note is running" }));

app.listen(Number(PORT), "0.0.0.0", () =>
  console.log(`Server running at http://localhost:${PORT}`),
);
