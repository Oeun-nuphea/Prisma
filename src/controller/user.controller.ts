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
    const loginResult = await UserService.loginUser(dto);
    const device = detectDeviceFromRequest(req);

    await UserService.saveLoginDevice(loginResult.user.id, {
      browser: device.browser,
      os: device.os,
    });

    res.status(200).json(loginResult);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
};
