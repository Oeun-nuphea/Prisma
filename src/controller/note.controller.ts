import { Request, Response } from "express";
import * as NoteService from "../service/note.service";
import { CreateNoteDto, UpdateNoteDto } from "../dto/note.dto";

type AuthenticatedRequest = Request & { userId?: number };

export const createNote = async (req: Request, res: Response) => {
  try {
    const userId =
      (req as AuthenticatedRequest).userId ?? Number(req.body?.userId);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const dto: CreateNoteDto = { title: req.body.title, body: req.body.body, isFavorite: req.body.isFavorite };
    const note = await NoteService.createNote(userId, dto);
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

export const getNoteById = async (req: Request, res: Response) => {
  try {
    const userId =
      (req as AuthenticatedRequest).userId ?? Number(req.body?.userId);
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const note = await NoteService.getNoteById(id, userId);
    res.status(200).json(note);
  } catch (err: any) {
    res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Internal Server Error" });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const userId =
      (req as AuthenticatedRequest).userId ?? Number(req.body?.userId);
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dto: UpdateNoteDto = { title: req.body.title, body: req.body.body };
    const note = await NoteService.updateNote(id, userId, dto);
    res.status(200).json(note);
  } catch (err: any) {
    res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Internal Server Error" });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const userId =
      (req as AuthenticatedRequest).userId ?? Number(req.body?.userId);
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await NoteService.softDeleteNote(id, userId);
    res.status(200).json({ message: "Note deleted" });
  } catch (err: any) {
    res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Internal Server Error" });
  }
};

export const toggleNoteFavorite = async (req: Request, res: Response) => {
  try {
    const userId =
      (req as AuthenticatedRequest).userId ?? Number(req.body?.userId);
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    if (!userId) return res.status(401).json({ message: "Unauthorized" });


    const note = await NoteService.toggleNoteFavorite(id, userId);
    res.status(200).json(note);
  } catch (err: any) {
    res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Internal Server Error" });
  }
};

export const shareNoteHandler = async (req: Request, res: Response) => {
  try {
    const userId =
      (req as AuthenticatedRequest).userId ?? Number(req.body?.userId);
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const result = await NoteService.shareNote(id, userId);
    res.status(200).json({
      shareUrl: `${process.env.BASE_URL}/notes/shared/${result.shareToken}`,
    });
  } catch (err: any) {
    res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Internal Server Error" });
  }
};

export const getNoteByTokenHandler = async (
  req: Request<{ token: string }>,  // 👈 type the params
  res: Response
) => {
  try {
    const { token } = req.params;
    const note = await NoteService.getNoteByShareToken(token);
    res.status(200).json(note);
  } catch (err: any) {
    res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Internal Server Error" });
  }
};