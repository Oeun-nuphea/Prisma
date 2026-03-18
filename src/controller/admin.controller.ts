import { Request, Response, NextFunction } from "express";
import AdminService from "../service/admin.service";
import { LoginAdminDto } from "../dto/admin.dto";

class AdminController {
  // ─── Auth ──────────────────────────────────────────────────────────────────

  loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: LoginAdminDto = req.body;
      const { refreshToken, ...safeResult } = await AdminService.loginAdmin(dto);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json(safeResult);
    } catch (err) {
      next(err);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.refreshToken as string | undefined;
      if (!token) return res.status(401).json({ message: "No refresh token provided" });

      const { accessToken, refreshToken: newRefreshToken } =
        await AdminService.refreshTokens(token);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ accessToken });
    } catch (err: any) {
      if (err.status === 401) {
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      }
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AdminService.logoutAdmin(req.user!.id); // ✅ from JWT

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  };

  // ─── User Management ───────────────────────────────────────────────────────

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10));
      const isActive = req.query.isActive === "true";
      const includeDeleted = req.query.includeDeleted === "true";
      const filters = {
        name: req.query.name ? String(req.query.name) : undefined,
        email: req.query.email ? String(req.query.email) : undefined,
      };

      const result = await AdminService.getAllUsers(page, limit, isActive, includeDeleted, filters);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const includeDeleted = req.query.includeDeleted === "true";

      const user = await AdminService.getUserById(id, includeDeleted);
      if (!user) return res.status(404).json({ message: "User not found" });

      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  toggleUserActive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const user = await AdminService.toggleUserActive(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const statusMessage = user.isActive
        ? "User account has been activated."
        : "User account has been deactivated.";

      res.status(200).json({ message: statusMessage, user });
    } catch (err) {
      next(err);
    }
  };
}

export default new AdminController();