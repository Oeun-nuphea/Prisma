import { prisma } from "../config/db";


export const getAllNoteOfUser = async (userId: number) => {
    prisma.note.findMany({
        where: { userId },
        select: { id: true, title: true, body: true, createdAt: true, updatedAt: true },
    });
}

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