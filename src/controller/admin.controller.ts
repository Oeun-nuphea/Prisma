import { Request, Response } from "express";
import * as AdminService from "../service/admin.service";
import { LoginAdminDto } from "../dto/admin.dto";

/**
 * POST /admin/login
 * Authenticate admin with email + password + privateKey
 */
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const dto: LoginAdminDto = req.body;
    const result = await AdminService.loginAdmin(dto);
    res.status(200).json(result);
  } catch (err: any) {
    res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Internal Server Error" });
  }
};

/**
 * GET /admin/users
 * Get all users (admin only)
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10),
    );
    const result = await AdminService.getAllUsers(page, limit);
    res.status(200).json(result);
  } catch (err: any) {
    res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Internal Server Error" });
  }
};

/**
 * GET /admin/users/:id
 * Get user by ID (admin only)
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const user = await AdminService.getUserById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err: any) {
    res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Internal Server Error" });
  }
};
