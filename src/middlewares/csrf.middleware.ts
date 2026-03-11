import { Request, Response, NextFunction } from "express";

const allowedOrigins: string[] = [
  "http://localhost:5173",
  "http://localhost:4000",
  process.env.FRONTEND_URL!,
].filter(Boolean);

export const csrfGuard = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const source = origin || (referer ? new URL(referer).origin : null);

    if (source && !allowedOrigins.includes(source)) {
      res.status(403).json({ error: "Forbidden: Invalid origin" });
      return;
    }
  }

  next();
};