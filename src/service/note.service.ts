import { prisma } from "../config/db";


export const getAllNoteOfUser = async (userId: number) => {
  return prisma.note.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      body: true,
    },
  });
};

export const getNoteById = async (id: number) => {
  return prisma.note.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      body: true,
    },
  });
};

export const createNote = async (userId: number, title: string, body: string) => {
  return prisma.note.create({
    data: { userId, title, body },
  });
};

export const updateNote = async (id: number, data: { title?: string; body?: string }) => {
  return prisma.note.update({ where: { id }, data });
};

export const softDeleteNote = async (id: number) => {
  return prisma.note.update({ where: { id }, data: { isDeleted: true } });
};