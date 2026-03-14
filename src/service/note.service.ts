import { prisma } from "../config/db";
import { CreateNoteDto, UpdateNoteDto } from "../dto/note.dto";
import { toNoteResponse, toNoteListResponse } from "../utils/mapper";
import { randomBytes } from "crypto";

export const getAllNoteOfUser = async (userId: number) => {
  const notes = await prisma.note.findMany({
    where: { userId, isDeleted: false },
  });
  return toNoteListResponse(notes);
};

export const createNote = async (userId: number, data: CreateNoteDto) => {
  const { title, body } = data;
  if(title.length > 51) throw new Error("Title is limited to 50 characters")
  const note = await prisma.note.create({ data: { userId, title, body } });
  return toNoteResponse(note);
};

export const getNoteById = async (id: number, userId: number) => {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.isDeleted)
    throw Object.assign(new Error("Note not found"), { status: 404 });
  if (note.userId !== userId)
    throw Object.assign(new Error("Note not found"), { status: 404 });
  return toNoteResponse(note);
};

export const updateNote = async (
  id: number,
  userId: number,
  data: UpdateNoteDto,
) => {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.isDeleted)
    throw Object.assign(new Error("Note not found"), { status: 404 });
  if (note.userId !== userId)
    throw Object.assign(new Error("Note not found"), { status: 404 });

  if (data.title) {
    if(data.title.length > 50) throw new Error("Title is limited to 50 characters")
  }

  const updated = await prisma.note.update({ where: { id }, data });
  return toNoteResponse(updated);
};

export const softDeleteNote = async (id: number, userId: number) => {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.isDeleted)
    throw Object.assign(new Error("Note not found"), { status: 404 });
  if (note.userId !== userId)
    throw Object.assign(new Error("Note not found"), { status: 404 });

  const deleted = await prisma.note.update({
    where: { id },
    data: { isDeleted: true },
  });
  return toNoteResponse(deleted);
};

export const toggleNoteFavorite = async (id: number, userId: number) =>{
  const note = await prisma.note.findUnique({where: {id}});

  if(!note || note.isDeleted) throw Object.assign(new Error("Note not found"), {status: 404})

  if(note.userId !== userId) throw Object.assign(new Error("Note not found"), {status: 404})

  const updatedFavorith = await prisma.note.update({
    where: {id},
    data: { isFavorite: !note.isFavorite}
  }) 

  return toNoteResponse(updatedFavorith)
}

export const shareNote = async (id: number, userId: number) => {
  const note = await prisma.note.findUnique({ where: { id } });

  if (!note || note.isDeleted)
    throw Object.assign(new Error("Note not found"), { status: 404 });
  if (note.userId !== userId)
    throw Object.assign(new Error("Note not found"), { status: 404 });

  const shareToken = note.shareToken ?? randomBytes(32).toString("hex");

  const updated = await prisma.note.update({
    where: { id },
    data: { shareToken },
  });

  return { shareToken: updated.shareToken };
};

export const getNoteByShareToken = async (token: string) => {
  const note = await prisma.note.findUnique({
    where: { shareToken: token },
  });

  if (!note || note.isDeleted)
    throw Object.assign(new Error("Note not found"), { status: 404 });

  return toNoteResponse(note);
};

export const deleteNoteByShareToken = async (id: number, userId: number) => {
  const note = await prisma.note.findUnique({ where: { id } });

  if (!note || note.isDeleted)
    throw Object.assign(new Error("Note not found"), { status: 404 });
  
  if(!note || note.shareToken === null) throw Object.assign(new Error("Share is not available"), {status: 403})

  const udpated = await prisma.note.update({
    where: {id},
    data: {shareToken: null}
  })
  return toNoteResponse(udpated)

}