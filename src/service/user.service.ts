import { prisma } from "../config/db";

export const getAllUsers = () =>
  prisma.user.findMany({
    where: { isDeleted: false },
    select: { id: true, name: true, email: true },
  });

export const getUserById = (id: number) =>
  prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
};

export const createUser = async (data: CreateUserInput) => {
  const { name, email, password } = data;

  if (!name || !email) {
    throw { status: 400, message: "Email and Name are required" };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw { status: 409, message: "Email already exists" };
  }

  return prisma.user.create({
    data: { name, email, password },
  });
};

export const updateUser = async (id: number, data: { name?: string; email?: string }) => {
  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== id)
      throw { status: 409, message: "Email already exists" };
  }

  return prisma.user.update({ where: { id }, data });
};

export const softDeleteUser = (id: number) =>
  prisma.user.update({ where: { id }, data: { isDeleted: true } });