import { prisma } from "../config/db";
import { signTokenPair } from "../config/jwt";
import { LoginAdminDto } from "../dto/admin.dto";
import { toAdminLoginResponse, toUserResponseWithStatus } from "../utils/mapper";
import bcrypt from "bcryptjs";
import { toUserResponse } from "../utils/mapper";

/**
 * Login admin with email, password, and privateKey (validated against ADMIN_SECRET)
 */
export const loginAdmin = async ({
  email,
  password,
  privateKey,
}: LoginAdminDto) => {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || privateKey !== adminSecret) {
    throw Object.assign(new Error("Invalid credentials"), { status: 403 });
  }

  const admin = await prisma.admin.findUnique({
    where: { email, isDeleted: false },
  });
  if (!admin)
    throw Object.assign(new Error("Invalid email or password"), {
      status: 401,
    });

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid)
    throw Object.assign(new Error("Invalid email or password"), {
      status: 401,
    });

  const { accessToken, refreshToken } = signTokenPair({
    userId: String(admin.id),
    name: admin.name,
    email: admin.email,
    role: "admin",
  });

  return { ...toAdminLoginResponse(admin, accessToken), refreshToken }; 
};

/**
 * get all user information (paginated)
 */
export const getAllUsers = async (
  page: number = 1,
  limit: number = 10,
  includeDeleted: boolean = false,
  filters: { name?: string; email?: string } = {},
) => {
  const where: Record<string, any> = includeDeleted ? {} : { isDeleted: false };

  if (filters.name) {
    where.name = { contains: filters.name, mode: "insensitive" };
  }
  if (filters.email) {
    where.email = { contains: filters.email, mode: "insensitive" };
  }

  const [users, meta] = await prisma.user
    .paginate({ where })
    .withPages({ page, limit, includePageCount: true });

  return {
    data: users.map(toUserResponse),
    meta,
  };
};

export const getUserById = async (
  id: number,
  includeDeleted: boolean = false,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
      ...(includeDeleted ? {} : { isDeleted: false }),
    },
  });

  if (!user) return null;
  return toUserResponse(user);
};

/**
 * Admin sets a user's isActive status (activate or deactivate)
 */
export const toggleUserActive = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.isDeleted) return null;

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });
  return toUserResponseWithStatus(updated);
};