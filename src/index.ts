import express, { Application } from "express";
import user from "./routes/user.routes";
import note from "./routes/note.routes";


const app: Application = express();
const PORT = 4000;

app.use(express.json());
app.use("/users", user);
app.use("/notes", note);


app.get("/", (_req, res) => res.json({ message: "Note is running" }));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
