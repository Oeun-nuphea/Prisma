import { prisma } from "../config/db";
import { signToken } from "../config/jwt";
import { LoginAdminDto } from "../dto/admin.dto";
import { toAdminLoginResponse } from "../utils/mapper";
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

  const token = signToken({
    userId: String(admin.id),
    name: admin.name,
    email: admin.email,
  });

  return toAdminLoginResponse(admin, token);
};




/**
 * get all user information
 */
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
