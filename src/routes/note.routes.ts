import { Router } from "express";
import * as NoteController from "../controller/note.controller";
import { authHandler } from "../middlewares/auth-handler";



const router = Router();

router.post("/", authHandler, NoteController.createNote);

export default router;