import { prisma } from "../config/db";
import { getTokenExpiryDate, signTokenPair, verifyRefreshToken } from "../config/jwt";
import { CreateUserDto, LoginUserDto } from "../dto/user.dto";
import { toUserResponse, toLoginResponse } from "../utils/mapper";
import bcrypt from "bcryptjs";

class UserService {
  // ─── Public ───────────────────────────────────────────────────────────────

  async createUser(data: CreateUserDto) {
    const { name, email, password } = data;

    if (!name || !email) {
      throw { status: 400, message: "Email and Name are required" };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw { status: 409, message: "Email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return toUserResponse(user);
  }

  async loginUser({ email, password }: LoginUserDto) {
    const user = await prisma.user.findUnique({ where: { email, isDeleted: false } });

    if (!user || !user.password) {
      throw { status: 401, message: "Invalid email or password" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw { status: 401, message: "Invalid email or password" };
    }

    if (!user.isActive) {
      throw { status: 403, message: "Your account has been deactivated. Please contact support." };
    }

    const { accessToken, refreshToken } = signTokenPair({
      userId: String(user.id),
      name: user.name,
      email: user.email,
      role: "user",
    });

    const refreshTokenExpiresAt = getTokenExpiryDate(refreshToken);
    if (!refreshTokenExpiresAt) {
      throw { status: 500, message: "Failed to derive refresh token expiry" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: await bcrypt.hash(refreshToken, 10),
        refreshTokenExpiresAt,
      },
    });

    return { ...toLoginResponse(user, accessToken), refreshToken };
  }

  async saveLoginDevice(userId: number, device: { browser: string; os: string; ip?: string }) {
    return prisma.userDevice.create({
      data: {
        userId,
        broswer: device.browser || "Unknown",
        os: device.os || "Unknown",
        ip: device.ip || null,
      },
    });
  }

  async refreshTokens(token: string) {
    let payload: { userId: string; role?: string };

    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw { status: 401, message: "Invalid or expired refresh token" };
    }

    const userId = Number(payload.userId);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });

      if (!user || user.isDeleted) {
        throw { status: 401, message: "Account not found" };
      }
      if (!user.isActive) {
        throw { status: 403, message: "Your account has been deactivated. Please contact support." };
      }
      if (!user.refreshTokenHash || !user.refreshTokenExpiresAt) {
        throw { status: 401, message: "Invalid or expired refresh token" };
      }
      if (user.refreshTokenExpiresAt <= new Date()) {
        throw { status: 401, message: "Invalid or expired refresh token" };
      }

      const isTokenValid = await bcrypt.compare(token, user.refreshTokenHash);
      if (!isTokenValid) {
        throw { status: 401, message: "Invalid or expired refresh token" };
      }

      const newTokens = signTokenPair({
        userId: String(user.id),
        name: user.name,
        email: user.email,
        role: "user",
      });

      const refreshTokenExpiresAt = getTokenExpiryDate(newTokens.refreshToken);
      if (!refreshTokenExpiresAt) {
        throw { status: 500, message: "Failed to derive refresh token expiry" };
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          refreshTokenHash: await bcrypt.hash(newTokens.refreshToken, 10),
          refreshTokenExpiresAt,
        },
      });

      return newTokens;
    });
  }

  // ─── Protected ────────────────────────────────────────────────────────────

  async softDeleteUser(id: number, requestingUserId: number) {
    if (requestingUserId !== id) {
      throw { status: 403, message: "Unauthorized: You can only delete your own account" };
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.isDeleted) return null;

    return prisma.user.update({ where: { id }, data: { isDeleted: true } });
  }

  async logoutUser(userId: number) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
    });
  }
}

export default new UserService();