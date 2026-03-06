import jwt from "jsonwebtoken";

const JWT_TOKEN = process.env.JWT_TOKEN ?? "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ||"10d";

export const signToken = (userId: string) =>
  jwt.sign({ userId }, JWT_EXPIRES_IN, { expiresIn: "7d" as any });

export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_TOKEN) as { userId: string };

