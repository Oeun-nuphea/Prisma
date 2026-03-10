import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/jwt";
import { prisma } from "../config/db";

type AuthenticatedRequest = Request & { userId?: number };

export const authHandler = async (
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
    const payload = verifyToken(token);

    if (!payload?.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const userId = Number(payload.userId);
    if (isNaN(userId) || userId <= 0) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Check the user still exists and is active
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.isDeleted) {
      return res.status(401).json({ message: "Account not found" });
    }
    if (!user.isActive) {
      return res
        .status(403)
        .json({
          message: "Your account has been deactivated. Please contact support.",
        });
    }

    (req as AuthenticatedRequest).userId = userId;
    if (!req.body || typeof req.body !== "object") req.body = {};
    req.body.userId = userId;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
