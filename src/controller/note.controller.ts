import { Request, Response } from "express";
import * as NoteService from "../service/note.service";

const parseId = (raw: string | string[]): number =>
  parseInt(Array.isArray(raw) ? raw[0] : raw, 10);

export const createNote = async (req: Request, res: Response) => {
    try {
        const { userId, title, body } = req.body;
        const note = await NoteService.createNote(userId, title, body);
        res.status(201).json(note);
    } catch (err: any) {
        res.status(err.status ?? 500).json({
        message: err.message ?? "Internal Server Error",
        });
    }
}