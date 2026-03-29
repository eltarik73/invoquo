import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 90;

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string | null;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(): {
  token: string;
  hash: string;
  expiresAt: Date;
} {
  const token = crypto.randomBytes(64).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  return { token, hash, expiresAt };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
