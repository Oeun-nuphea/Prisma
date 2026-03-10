import { Request, Response } from "express";
import * as UserService from "../service/user.service";
import { detectDeviceFromRequest } from "../utils/device-detector";
import { CreateUserDto, UpdateUserDto, LoginUserDto } from "../dto/user.dto";

const parseId = (raw: string | string[]): number =>
  parseInt(Array.isArray(raw) ? raw[0] : raw, 10);

/**
 * These all below are for normal user
 * @param req
 * @param res
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const dto: CreateUserDto = req.body;
    const user = await UserService.createUser(dto);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(err.status ?? 500).json({
      message: err.message ?? "Internal Server Error",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const requestingUserId = req.body.userId as number;
    if (!requestingUserId)
      return res.status(401).json({ message: "Unauthorized" });

    const user = await UserService.softDeleteUser(id, requestingUserId);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(204).send();
  } catch (err: any) {
    if (err.message.startsWith("Unauthorized"))
      return res.status(403).json({ message: err.message });
    res.status(err.status ?? 500).json({ message: err.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
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
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json(loginResult); // accessToken + user, no refreshToken exposed
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token)
      return res.status(401).json({ message: "No refresh token provided" });

    const { accessToken, refreshToken: newRefreshToken } =
      await UserService.refreshTokens(token);

    // Rotate: replace the old cookie with the new refresh token
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({ accessToken });
  } catch (err: any) {
    return res
      .status(err.status ?? 500)
      .json({ message: err.message ?? "Internal Server Error" });
  }
};
