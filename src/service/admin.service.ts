import { prisma } from "../config/db";
import {
  getTokenExpiryDate,
  signTokenPair,
  verifyRefreshToken,
} from "../config/jwt";
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

  const refreshTokenExpiresAt = getTokenExpiryDate(refreshToken);
  if (!refreshTokenExpiresAt)
    throw new Error("Failed to derive refresh token expiry");

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      refreshTokenHash: await bcrypt.hash(refreshToken, 10),
      refreshTokenExpiresAt,
    },
  });

  return { ...toAdminLoginResponse(admin, accessToken), refreshToken };
};

export const refreshTokens = async (token: string) => {
  // 1. Verify JWT signature before touching the DB
  let payload: { userId: string; role?: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw Object.assign(new Error("Invalid or expired refresh token"), { status: 401 });
  }

  if (payload.role !== "admin")
    throw Object.assign(new Error("Forbidden: admin access only"), { status: 403 });

  const adminId = Number(payload.userId);

  // 2. Wrap the entire consume-and-reissue cycle in a transaction.
  //    This guarantees the token is invalidated exactly once, even under
  //    concurrent requests with the same token.
  const tokens = await prisma.$transaction(async (tx) => {
    const admin = await tx.admin.findUnique({ where: { id: adminId } });

    if (!admin || admin.isDeleted)
      throw Object.assign(new Error("Account not found"), { status: 401 });

    if (!admin.refreshTokenHash || !admin.refreshTokenExpiresAt)
      throw Object.assign(new Error("Invalid or expired refresh token"), { status: 401 });

    // 3. Reject expired tokens before the bcrypt work
    if (admin.refreshTokenExpiresAt <= new Date())
      throw Object.assign(new Error("Invalid or expired refresh token"), { status: 401 });

    // 4. Validate the presented token against the stored hash
    const isTokenValid = await bcrypt.compare(token, admin.refreshTokenHash);
    if (!isTokenValid)
      throw Object.assign(new Error("Invalid or expired refresh token"), { status: 401 });

    // 5. Generate the replacement token pair
    const newTokens = signTokenPair({
      userId: String(admin.id),
      name: admin.name,
      email: admin.email,
      role: "admin",
    });

    const refreshTokenExpiresAt = getTokenExpiryDate(newTokens.refreshToken);
    if (!refreshTokenExpiresAt)
      throw Object.assign(new Error("Failed to derive refresh token expiry"), { status: 500 });

    // 6. Atomically overwrite the old hash — the old token is now dead
    await tx.admin.update({
      where: { id: admin.id },
      data: {
        refreshTokenHash: await bcrypt.hash(newTokens.refreshToken, 10),
        refreshTokenExpiresAt,
      },
    });

    return newTokens;
  });

  return tokens;
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
