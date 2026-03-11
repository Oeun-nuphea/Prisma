import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../config/jwt";

export type AdminRequest = Request & { adminId?: number };

export const adminHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    if (!payload?.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Only allow tokens that were issued for an admin (role = "admin")
    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin access only" });
    }

    const adminId = Number(payload.userId);
    if (isNaN(adminId) || adminId <= 0) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    (req as AdminRequest).adminId = adminId;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
