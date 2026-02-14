import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function generateToken(adminId: string): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as unknown as number,
  };
  return jwt.sign({ id: adminId }, JWT_SECRET, options);
}

export function verifyToken(token: string): { id: string } {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.verify(token, JWT_SECRET) as { id: string };
}
