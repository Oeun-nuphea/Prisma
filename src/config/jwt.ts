import jwt from "jsonwebtoken";

const JWT_TOKEN = process.env.JWT_TOKEN ?? "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ||"10d";

type UserData = {
  userId: string;
  name: string;
  email: string;
};

export const signToken = ({ userId, email, name }: UserData) =>
  jwt.sign({ userId, email, name }, JWT_EXPIRES_IN, { expiresIn: "7d" as any });

export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_TOKEN) as { userId: string };

