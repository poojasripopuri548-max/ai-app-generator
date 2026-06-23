import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export type SessionUser = {
  id: string;
  email: string;
};

export function getSessionUser(req: NextRequest): SessionUser | null {
  const token = req.cookies.get("token")?.value;

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as Partial<SessionUser>;

    if (!decoded.id || !decoded.email) {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
    };
  } catch {
    return null;
  }
}
