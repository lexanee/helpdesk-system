import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";
import { env } from "../config/env.config.js";

export interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token && req.cookies) {
    token = req.cookies["accessToken"];
  }

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded: any = jwt.verify(token, env.JWT_SECRET);

    // Check if session is valid (revoked or not)
    if (decoded.sessionId) {
      const session = await prisma.refreshToken.findUnique({
        where: { id: decoded.sessionId },
      });

      if (!session || session.revoked) {
        return res.status(401).json({ error: "Session revoked" });
      }
    }

    // Fetch user with role and permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }

    // Flatten permissions
    const permissions =
      user.role?.permissions.map((rp) => rp.permission.slug) || [];

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role?.name || "customer",
      permissions: permissions,
    };

    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        error: `Missing permission: ${permission}`,
      });
    }

    next();
  };
};
