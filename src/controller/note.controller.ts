import { Request, Response, NextFunction } from "express";
import NoteService from "../service/note.service";
import { CreateNoteDto, UpdateNoteDto } from "../dto/note.dto";

class NoteController {
  // ─── Helper ────────────────────────────────────────────────────────────────

  private parseId(raw: string | string[]): number {
    return Number(Array.isArray(raw) ? raw[0] : raw);
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  createNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const dto: CreateNoteDto = {
        title: req.body.title,
        body: req.body.body,
        isFavorite: req.body.isFavorite,
      };
      const note = await NoteService.createNote(userId, dto);
      res.status(201).json(note);
    } catch (err) {
      next(err);
    }
  };

  getNotesByOneUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.id;
      const page = Math.max(
        1,
        parseInt(String(req.query.page ?? "1"), 10) || 1,
      );
      const limit = Math.min(
        100,
        Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10),
      );

      const result = await NoteService.getAllNoteOfUser(userId, page, limit);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getNoteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const id = this.parseId(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const note = await NoteService.getNoteById(id, userId);
      res.status(200).json(note);
    } catch (err) {
      next(err);
    }
  };

  updateNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const id = this.parseId(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const dto: UpdateNoteDto = {
        title: req.body.title,
        body: req.body.body,
      };
      const note = await NoteService.updateNote(id, userId, dto);
      res.status(200).json(note);
    } catch (err) {
      next(err);
    }
  };

  deleteNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const id = this.parseId(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      await NoteService.softDeleteNote(id, userId);
      res.status(200).json({ message: "Note deleted" });
    } catch (err) {
      next(err);
    }
  };

  toggleNoteFavorite = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.id;
      const id = this.parseId(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const note = await NoteService.toggleNoteFavorite(id, userId);
      res.status(200).json(note);
    } catch (err) {
      next(err);
    }
  };

  // ─── Share ─────────────────────────────────────────────────────────────────

  shareNoteHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.id;
      const id = this.parseId(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const result = await NoteService.shareNote(id, userId);
      res.status(200).json({
        shareUrl: `${process.env.BASE_URL}/notes/shared/${result.shareToken}`,
      });
    } catch (err) {
      next(err);
    }
  };

  // ─── Public — no auth needed, token proves access ──────────────────────────

  getNoteByTokenHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const token = Array.isArray(req.params.token)
        ? req.params.token[0]
        : req.params.token;
      const note = await NoteService.getNoteByShareToken(token);
      res.status(200).json(note);
    } catch (err) {
      next(err);
    }
  };

  deleteNoteByTokenHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.id;
      const id = this.parseId(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      await NoteService.deleteNoteByShareToken(id, userId);
      res.status(200).json({ message: "Note share deleted" });
    } catch (err) {
      next(err);
    }
  };
}

export default new NoteController();
