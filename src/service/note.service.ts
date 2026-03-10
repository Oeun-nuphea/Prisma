import { prisma } from "../config/db";
import { CreateNoteDto, UpdateNoteDto } from "../dto/note.dto";
import { toNoteResponse, toNoteListResponse } from "../utils/mapper";

export const getAllNoteOfUser = async (userId: number) => {
  const notes = await prisma.note.findMany({ where: { userId, isDeleted: false } });
  return toNoteListResponse(notes);
};

export const createNote = async (userId: number, data: CreateNoteDto) => {
  const { title, body } = data;
  const note = await prisma.note.create({ data: { userId, title, body } });
  return toNoteResponse(note);
};

export const getNoteById = async (id: number, userId: number) => {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.isDeleted || note.userId !== userId) return null;
  return toNoteResponse(note);
};

export const updateNote = async (id: number, userId: number, data: UpdateNoteDto) => {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.isDeleted || note.userId !== userId) return null;

  const updated = await prisma.note.update({ where: { id }, data });
  return toNoteResponse(updated);
};

export const softDeleteNote = async (id: number, userId: number) => {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.isDeleted || note.userId !== userId) return null;

  const deleted = await prisma.note.update({ where: { id }, data: { isDeleted: true } });
  return toNoteResponse(deleted);
};