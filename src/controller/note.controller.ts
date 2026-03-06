import { Request, Response } from "express";
import * as NoteService from "../service/note.service";

type AuthenticatedRequest = Request & { userId?: number };

export const createNote = async (req: Request, res: Response) => {
  try {
    const userId =
      (req as AuthenticatedRequest).userId ?? Number(req.body?.userId);
    const { title, body } = req.body;
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const note = await NoteService.createNote(userId, title, body);
    res.status(201).json(note);
  } catch (err: any) {
    res.status(err.status ?? 500).json({
      message: err.message ?? "Internal Server Error",
    });
  }
};

export const getNotesByOneUser = async (req: Request, res: Response) => {
  try {
    const userId =
      (req as AuthenticatedRequest).userId ?? Number(req.body?.userId);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid ID" });
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const notes = await NoteService.getAllNoteOfUser(userId);
    res.status(200).json(notes);
  } catch (err: any) {
    res.status(err.status ?? 500).json({
      message: err.message ?? "Internal Server Error",
    });
  }
};
