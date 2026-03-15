import { Request, Response, NextFunction } from "express";
import { detectDeviceFromRequest } from "../utils/device-detector";
import { CreateUserDto, LoginUserDto } from "../dto/user.dto";
import UserService from "../service/user.service"; // ✅ default import


const parseId = (raw: string | string[]): number =>
  parseInt(Array.isArray(raw) ? raw[0] : raw, 10);

class UserController {
  // ─── Public ───────────────────────────────────────────────────────────────

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: CreateUserDto = req.body;
      const user = await UserService.createUser(dto);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: LoginUserDto = req.body;
      const { refreshToken, ...loginResult } = await UserService.loginUser(dto);
      const device = detectDeviceFromRequest(req);

      await UserService.saveLoginDevice(loginResult.user.id, {
        browser: device.browser,
        os: device.os,
        ip: device.ip,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json(loginResult);
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken as string | undefined;
      if (!token) return res.status(401).json({ message: "No refresh token provided" });

      const { accessToken, refreshToken: newRefreshToken } =
        await UserService.refreshTokens(token);

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
  }

  // ─── Protected ────────────────────────────────────────────────────────────

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const user = await UserService.softDeleteUser(id, req.user!.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.logoutUser(req.user!.id);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  }
}

// Export a single instance — no need to instantiate per request
export default new UserController();