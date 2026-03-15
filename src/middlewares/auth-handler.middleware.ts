import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../config/jwt";
import { prisma } from "../config/db";

// ✅ Declare once here — available across the entire project
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string };
    }
  }
}

export const authHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    if (!payload?.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const userId = Number(payload.userId);
    if (isNaN(userId) || userId <= 0) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.isDeleted) {
      return res.status(401).json({ message: "Account not found" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated. Please contact support." });
    }

    // ✅ Attach to req.user — never to req.body
    req.user = { id: userId, role: user.role };

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};