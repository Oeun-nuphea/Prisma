import express, { Application } from "express";
import user from "./routes/user.routes";
import note from "./routes/note.routes";
import cors from "cors";



const app: Application = express();
const PORT = 4000;

app.use(cors());

app.use(express.json());
app.use("/users", user);
app.use("/notes", note);


app.get("/", (_req, res) => res.json({ message: "Note is running" }));

app.listen(PORT, "0.0.0.0", () => 
  console.log(`Server running at http://0.0.0.0:${PORT}`)
);