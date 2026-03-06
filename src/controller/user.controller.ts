import { Request, Response } from "express";
import * as UserService from "../service/user.service";

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
  res.json(user);
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await UserService.createUser(req.body);

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

    const user = await UserService.updateUser(id, req.body);
    res.status(200).json(user);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const user = await UserService.softDeleteUser(id);
    res.status(200).json(user);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await UserService.loginUser(email, password);
    res.status(200).json(user);
  } catch (err: any) {
    res.status(err.status ?? 500).json({ message: err.message });
  }
}