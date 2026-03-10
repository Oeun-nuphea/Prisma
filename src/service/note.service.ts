import { prisma } from "../config/db";
import { CreateNoteDto, UpdateNoteDto } from "../dto/note.dto";
import { toNoteResponse, toNoteListResponse } from "../utils/mapper";

export const getAllNoteOfUser = async (userId: number) => {
  const notes = await prisma.note.findMany({ where: { userId } });
  return toNoteListResponse(notes);
};

export const getNoteById = async (id: number) => {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) return null;
  return toNoteResponse(note);
};

export const createNote = async (userId: number, data: CreateNoteDto) => {
  const { title, body } = data;
  const note = await prisma.note.create({ data: { userId, title, body } });
  return toNoteResponse(note);
};

export const updateNote = async (id: number, data: UpdateNoteDto) => {
  const note = await prisma.note.update({ where: { id }, data });
  return toNoteResponse(note);
};

export const softDeleteNote = async (id: number) => {
  return prisma.note.update({ where: { id }, data: { isDeleted: true } });
};
