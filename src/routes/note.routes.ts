import { Router } from "express";
import * as NoteController from "../controller/note.controller";
import { authHandler } from "../middlewares/auth-handler";



const router = Router();

router.post("/", authHandler, NoteController.createNote);
router.get("/one-user", authHandler, NoteController.getNotesByOneUser);
router.get("/one-user/:id", authHandler, NoteController.getNoteById);
router.patch("/one-user/:id", authHandler, NoteController.updateNote);
router.patch("/one-user/:id/delete", authHandler, NoteController.deleteNote);

export default router;