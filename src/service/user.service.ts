import { prisma } from "../config/db";
import { signTokenPair, verifyRefreshToken } from "../config/jwt";
import { CreateUserDto, UpdateUserDto, LoginUserDto } from "../dto/user.dto";
import { toUserResponse, toLoginResponse } from "../utils/mapper";
import bcrypt from "bcryptjs";

/**
 * Normal user for all below
 * @param data
 * @returns
 */
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

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });
  return toUserResponse(user);
};

export const loginUser = async ({ email, password }: LoginUserDto) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) throw new Error("Invalid email or password");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Invalid email or password");

  if (!user.isActive)
    throw Object.assign(
      new Error("Your account has been deactivated. Please contact support."),
      { status: 403 },
    );

  const { accessToken, refreshToken } = signTokenPair({
    userId: String(user.id),
    name: user.name,
    email: user.email,
    role: "user",
  });

  return { ...toLoginResponse(user, accessToken), refreshToken };
};

export const saveLoginDevice = (
  userId: number,
  device: { browser: string; os: string; ip?: string },
) =>
  prisma.userDevice.create({
    data: {
      userId,
      broswer: device.browser || "Unknown",
      os: device.os || "Unknown",
      ip: device.ip || null,
    },
  });

export const softDeleteUser = async (id: number, requestingUserId: number) => {
  if (requestingUserId !== id)
    throw new Error("Unauthorized: You can only delete your own account");

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user || user.isDeleted) return null;

  return prisma.user.update({ where: { id }, data: { isDeleted: true } });
};

export const refreshTokens = async (token: string) => {
  let payload: { userId: string; role?: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw Object.assign(new Error("Invalid or expired refresh token"), {
      status: 401,
    });
  }

  const userId = Number(payload.userId);
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.isDeleted)
    throw Object.assign(new Error("Account not found"), { status: 401 });

  if (!user.isActive)
    throw Object.assign(
      new Error("Your account has been deactivated. Please contact support."),
      { status: 403 },
    );

  return signTokenPair({
    userId: String(user.id),
    name: user.name,
    email: user.email,
    role: "user",
  });
};
