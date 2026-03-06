import "dotenv/config";
import jwt from "jsonwebtoken";

const JWT_TOKEN = process.env.JWT_TOKEN ?? "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "10d";

type UserData = {
  userId: string;
  name: string;
  email: string;
};

const getJwtSecret = () => {
  if (!JWT_TOKEN) {
    throw new Error("Missing JWT_TOKEN in environment variables");
  }

  return JWT_TOKEN;
};

export const signToken = ({ userId, email, name }: UserData) =>
  jwt.sign({ userId, email, name }, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

export const verifyToken = (token: string) =>
  jwt.verify(token, getJwtSecret()) as { userId: string };
