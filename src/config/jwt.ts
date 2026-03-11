import "dotenv/config";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET ?? "";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET ?? "";

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

type UserData = {
  userId: string;
  name: string;
  email: string;
  role?: string;
};

type TokenPayload = {
  userId: string;
  role?: string;
};

// ─── Secret Getters ────────────────────────────────────────────────────────────

const getAccessSecret = () => {
  if (!ACCESS_TOKEN_SECRET) throw new Error("Missing ACCESS_TOKEN_SECRET");
  return ACCESS_TOKEN_SECRET;
};

const getRefreshSecret = () => {
  if (!REFRESH_TOKEN_SECRET) throw new Error("Missing REFRESH_TOKEN_SECRET");
  return REFRESH_TOKEN_SECRET;
};

// ─── Sign Tokens ───────────────────────────────────────────────────────────────

export const signAccessToken = ({ userId, email, name, role }: UserData) =>
  jwt.sign({ userId, email, name, role }, getAccessSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

export const signRefreshToken = ({ userId, role }: Pick<UserData, "userId" | "role">) =>
  jwt.sign({ userId, role }, getRefreshSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

// Sign both at once — use this on login / refresh
export const signTokenPair = (user: UserData) => ({
  accessToken: signAccessToken(user),
  refreshToken: signRefreshToken(user),
});

// ─── Verify Tokens ─────────────────────────────────────────────────────────────

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, getAccessSecret()) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, getRefreshSecret()) as TokenPayload;

export const getTokenExpiryDate = (token: string): Date | null => {
  const decoded = jwt.decode(token) as jwt.JwtPayload | null;
  if (!decoded || typeof decoded.exp !== "number") return null;
  return new Date(decoded.exp * 1000);
};
