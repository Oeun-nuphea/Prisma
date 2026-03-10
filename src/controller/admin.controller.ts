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
    const includeDeleted = req.query.includeDeleted === "true";
    const filters = {
      name: req.query.name ? String(req.query.name) : undefined,
      email: req.query.email ? String(req.query.email) : undefined,
    };
    const result = await AdminService.getAllUsers(
      page,
      limit,
      includeDeleted,
      filters,
    );
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

    const includeDeleted = req.query.includeDeleted === "true";

    const user = await AdminService.getUserById(id, includeDeleted);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err: any) {
    res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Internal Server Error" });
  }
};

/**
 * PATCH /admin/users/:id/deactivate
 * Deactivate a user account (admin only)
 */
export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const user = await AdminService.setUserActive(id, false);
    if (!user) return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({ message: "User account has been deactivated.", user });
  } catch (err: any) {
    res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Internal Server Error" });
  }
};

/**
 * PATCH /admin/users/:id/activate
 * Activate a user account (admin only)
 */
export const activateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const user = await AdminService.setUserActive(id, true);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User account has been activated.", user });
  } catch (err: any) {
    res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Internal Server Error" });
  }
};
