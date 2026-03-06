import { Router } from "express";
import * as NoteController from "../controller/note.controller";

const router = Router();

router.post("/", NoteController.createNote);

export default router;