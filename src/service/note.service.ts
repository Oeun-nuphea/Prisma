import { prisma } from "../config/db";
import { CreateNoteDto, UpdateNoteDto } from "../dto/note.dto";
import { toNoteResponse, toNoteListResponse } from "../utils/mapper";
import { randomBytes } from "crypto";
import ImageKitService from "./imagekit.service";

class NoteService {
  // ─── Helper — reuse across methods ────────────────────────────────────────

  private async findOwnedNote(id: number, userId: number) {
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.isDeleted)
      throw { status: 404, message: "Note not found" };
    if (note.userId !== userId)
      throw { status: 404, message: "Note not found" };

    return note;
  }

  private extractFileIds(body: unknown): string[] {
    if (!Array.isArray(body)) return [];
    return body
      .filter((block: any) => block.type === "image" && block.fileId)
      .map((block: any) => block.fileId);
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  async getAllNoteOfUser(userId: number, page: number = 1, limit: number = 10) {
    const [notes, meta] = await prisma.note
      .paginate({ where: { userId, isDeleted: false } })
      .withPages({ page, limit, includePageCount: true });

    return {
    data: toNoteListResponse(notes),
    meta: {
      ...meta,
      // 👇 ensure hasNextPage is always present so frontend can stop fetching
      hasNextPage: meta.currentPage < meta.pageCount,
    },
  };
  }

  async createNote(userId: number, data: CreateNoteDto) {
    const { title, body } = data;

    if (title.length > 50) {
      throw { status: 400, message: "Title is limited to 50 characters" };
    }

    const note = await prisma.note.create({ data: { userId, title, body } });
    return toNoteResponse(note);
  }

  async getNoteById(id: number, userId: number) {
    const note = await this.findOwnedNote(id, userId);
    return toNoteResponse(note);
  }

  async updateNote(id: number, userId: number, data: UpdateNoteDto) {
    await this.findOwnedNote(id, userId);

    if (data.title && data.title.length > 50) {
      throw { status: 400, message: "Title is limited to 50 characters" };
    }

    const updated = await prisma.note.update({ where: { id }, data });
    return toNoteResponse(updated);
  }

  async softDeleteNote(id: number, userId: number) {
    const note = await this.findOwnedNote(id, userId);

    // 👇 Clean up ImageKit before deleting
    const fileIds = this.extractFileIds(note.body);
    if (fileIds.length > 0) {
      await Promise.all(
        fileIds.map((fileId) => ImageKitService.deleteFile(fileId)),
      );
    }

    return prisma.note.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async toggleNoteFavorite(id: number, userId: number) {
    const note = await this.findOwnedNote(id, userId);

    const updated = await prisma.note.update({
      where: { id },
      data: { isFavorite: !note.isFavorite },
    });
    return toNoteResponse(updated);
  }

  // ─── Share ─────────────────────────────────────────────────────────────────

  async shareNote(id: number, userId: number) {
    const note = await this.findOwnedNote(id, userId);

    const shareToken = note.shareToken ?? randomBytes(32).toString("hex");

    const updated = await prisma.note.update({
      where: { id },
      data: { shareToken },
    });

    return { shareToken: updated.shareToken };
  }

  async getNoteByShareToken(token: string) {
    const note = await prisma.note.findUnique({ where: { shareToken: token } });

    if (!note || note.isDeleted) {
      throw { status: 404, message: "Note not found" };
    }

    return toNoteResponse(note);
  }

  async deleteNoteByShareToken(id: number, userId: number) {
    const note = await this.findOwnedNote(id, userId);

    if (!note.shareToken) {
      throw { status: 403, message: "Share is not available" };
    }

    const updated = await prisma.note.update({
      where: { id },
      data: { shareToken: null },
    });
    return toNoteResponse(updated);
  }
}

export default new NoteService();
