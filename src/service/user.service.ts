import { prisma } from "../config/db";
import { signToken } from "../config/jwt";
import { CreateUserDto, UpdateUserDto, LoginUserDto } from "../dto/user.dto";
import { toUserResponse, toLoginResponse } from "../utils/mapper";
import bcrypt from "bcryptjs";

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    where: { isDeleted: false },
  });
  return users.map(toUserResponse);
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;
  return toUserResponse(user);
};

export const createUser = async (data: CreateUserDto) => {
  const { name, email, password } = data;

  if (!name || !email) {
    throw { status: 400, message: "Email and Name are required" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw { status: 409, message: "Email already exists" };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });
  return toUserResponse(user);
};

export const updateUser = async (id: number, data: UpdateUserDto) => {
  if (data.email) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing && existing.id !== id)
      throw { status: 409, message: "Email already exists" };
  }

  const user = await prisma.user.update({ where: { id }, data });
  return toUserResponse(user);
};

export const loginUser = async ({ email, password }: LoginUserDto) => {
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || !user.password) throw new Error("Invalid email or password");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Invalid email or password");

  const token = signToken({
    userId: String(user.id),
    name: user.name,
    email: user.email,
  });

  return toLoginResponse(user, token);
};

export const saveLoginDevice = (
  userId: number,
  device: { browser: string; os: string },
) =>
  prisma.userDevice.create({
    data: {
      userId,
      broswer: device.browser || "Unknown",
      os: device.os || "Unknown",
    },
  });

export const softDeleteUser = (id: number) =>
  prisma.user.update({ where: { id }, data: { isDeleted: true } });
