import { prisma } from "../config/db";
import {
  getTokenExpiryDate,
  signTokenPair,
  verifyRefreshToken,
} from "../config/jwt";
import { LoginAdminDto } from "../dto/admin.dto";
import {
  toAdminLoginResponse,
  toUserDeviceResponse,
  toUserResponse,
  toUserResponseWithStatus,
} from "../utils/mapper";
import bcrypt from "bcryptjs";

class AdminService {
  // ─── Auth ──────────────────────────────────────────────────────────────────

  async loginAdmin({ email, password, privateKey }: LoginAdminDto) {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || privateKey !== adminSecret) {
      throw { status: 403, message: "Invalid credentials" };
    }

    const admin = await prisma.admin.findUnique({
      where: { email, isDeleted: false },
    });
    if (!admin) throw { status: 401, message: "Invalid email or password" };

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid)
      throw { status: 401, message: "Invalid email or password" };

    const { accessToken, refreshToken } = signTokenPair({
      userId: String(admin.id),
      name: admin.name,
      email: admin.email,
      role: "admin",
    });

    const refreshTokenExpiresAt = getTokenExpiryDate(refreshToken);
    if (!refreshTokenExpiresAt) {
      throw { status: 500, message: "Failed to derive refresh token expiry" };
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        refreshTokenHash: await bcrypt.hash(refreshToken, 10),
        refreshTokenExpiresAt,
      },
    });

    return { ...toAdminLoginResponse(admin, accessToken), refreshToken };
  }

  async refreshTokens(token: string) {
    let payload: { userId: string; role?: string };

    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw { status: 401, message: "Invalid or expired refresh token" };
    }

    if (payload.role !== "admin") {
      throw { status: 403, message: "Forbidden: admin access only" };
    }

    const adminId = Number(payload.userId);

    return prisma.$transaction(async (tx) => {
      const admin = await tx.admin.findUnique({ where: { id: adminId } });

      if (!admin || admin.isDeleted) {
        throw { status: 401, message: "Account not found" };
      }
      if (!admin.refreshTokenHash || !admin.refreshTokenExpiresAt) {
        throw { status: 401, message: "Invalid or expired refresh token" };
      }
      if (admin.refreshTokenExpiresAt <= new Date()) {
        throw { status: 401, message: "Invalid or expired refresh token" };
      }

      const isTokenValid = await bcrypt.compare(token, admin.refreshTokenHash);
      if (!isTokenValid) {
        throw { status: 401, message: "Invalid or expired refresh token" };
      }

      const newTokens = signTokenPair({
        userId: String(admin.id),
        name: admin.name,
        email: admin.email,
        role: "admin",
      });

      const refreshTokenExpiresAt = getTokenExpiryDate(newTokens.refreshToken);
      if (!refreshTokenExpiresAt) {
        throw { status: 500, message: "Failed to derive refresh token expiry" };
      }

      await tx.admin.update({
        where: { id: admin.id },
        data: {
          refreshTokenHash: await bcrypt.hash(newTokens.refreshToken, 10),
          refreshTokenExpiresAt,
        },
      });

      return newTokens;
    });
  }

  async logoutAdmin(adminId: number) {
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
    });
  }

  // ─── User Management ───────────────────────────────────────────────────────

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    isActive: boolean = true,
    includeDeleted: boolean = false,
    filters: { name?: string; email?: string } = {},
  ) {
    const where: Record<string, any> = includeDeleted
      ? {}
      : { isDeleted: false };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (filters.name) {
      where.name = { contains: filters.name, mode: "insensitive" };
    }
    if (filters.email) {
      where.email = { contains: filters.email, mode: "insensitive" };
    }

    const [users, meta] = await prisma.user
      .paginate({ where })
      .withPages({ page, limit, isActive, includePageCount: true });

    return { data: users.map(toUserResponse), meta };
  }

  async getAllUserDevice(
    page: number = 1,
    limit: number = 10,
    includeDeleted: boolean = false,
  ) {
    const where: Record<string, any> = includeDeleted
      ? {}
      : { isDeleted: false };

    const [devices, meta] = await prisma.userDevice
      .paginate({
        where,
        select: {
          id: true,
          userId: true,
          broswer: true,
          os: true,
          ip: true,
          isDeleted: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              isActive: true,
              isDeleted: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      })
      .withPages({ page, limit, includePageCount: true });

    return { data: devices.map(toUserDeviceResponse), meta };
  }

  async getUserById(id: number, includeDeleted: boolean = false) {
    const user = await prisma.user.findUnique({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    if (!user) return null;
    return toUserResponse(user);
  }

  async toggleUserActive(id: number) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.isDeleted) return null;

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
    return toUserResponseWithStatus(updated);
  }
}

export default new AdminService();
