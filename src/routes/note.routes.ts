import { Router } from "express";
import * as NoteController from "../controller/note.controller";
import { authHandler } from "../middlewares/auth-handler";
import { validate } from "../middlewares/validate";
import { CreateNoteSchema, UpdateNoteSchema } from "../schemas/note.schema";

const router = Router();

router.post(
  "/",
  authHandler,
  validate(CreateNoteSchema),
  NoteController.createNote,
);
router.get("/one-user", authHandler, NoteController.getNotesByOneUser);
router.get("/one-user/:id", authHandler, NoteController.getNoteById);
router.patch(
  "/one-user/:id",
  authHandler,
  validate(UpdateNoteSchema),
  NoteController.updateNote,
);
router.patch("/one-user/:id/delete", authHandler, NoteController.deleteNote);

export default router;
