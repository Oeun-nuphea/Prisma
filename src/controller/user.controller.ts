import { Request, Response } from "express";
import * as UserService from "../service/user.service";
import { detectDeviceFromRequest } from "../utils/device-detector";
import { CreateUserDto, UpdateUserDto, LoginUserDto } from "../dto/user.dto";

const parseId = (raw: string | string[]): number =>
  parseInt(Array.isArray(raw) ? raw[0] : raw, 10);

export const getUsers = async (_req: Request, res: Response) => {
  const users = await UserService.getAllUsers();
  res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

  const user = await UserService.getUserById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

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

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const dto: UpdateUserDto = req.body;
    const user = await UserService.updateUser(id, dto);
    res.status(200).json(user);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    await UserService.softDeleteUser(id);
    res.status(200).json({ message: "User deleted" });
  } catch (err: any) {
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
