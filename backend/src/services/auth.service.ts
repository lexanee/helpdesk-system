import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../utils/prisma.js";
import { env } from "../config/env.config.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
  role: z
    .enum(["customer", "support_agent", "administrator", "manager"])
    .optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (data: z.infer<typeof registerSchema>) => {
  const { email, password, fullName, role } = registerSchema.parse(data);

  const existingUser = await prisma.user.findFirst({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email,
      fullName,
      role: {
        connect: { name: role || "customer" },
      },
      password: hashedPassword,
    },
    include: { role: true },
  });

  return generateTokens(user.id, user.email, user.role?.name || "customer");
};

export const login = async (data: z.infer<typeof loginSchema>) => {
  const { email, password } = loginSchema.parse(data);

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    include: { role: true },
  });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  return generateTokens(user.id, user.email, user.role?.name || "customer");
};

const generateTokens = async (userId: string, email: string, role: string) => {
  const refreshToken = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Store refresh token in database
  const session = await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  const accessToken = jwt.sign(
    { userId, email, role, sessionId: session.id },
    env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  return { accessToken, refreshToken, user: { id: userId, email, role } };
};

export const refresh = async (token: string) => {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as any;

    // Find token in DB
    const savedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { include: { role: true } } },
    });

    // Reuse detection: if token not found but valid signature, it might have been rotated/deleted
    // Or if found but revoked
    if (!savedToken || savedToken.revoked) {
      // Potential theft: Revoke all tokens for this user if we could identify them
      // For now, just throw invalid
      throw new Error("Invalid refresh token");
    }

    const user = savedToken.user;

    if (user.deletedAt) {
      throw new Error("User account is deleted");
    }

    // Revoke the used token (Rotation)
    await prisma.refreshToken.update({
      where: { id: savedToken.id },
      data: { revoked: true },
    });

    // Generate new tokens
    const newTokens = await generateTokens(
      user.id,
      user.email,
      user.role?.name || "customer",
    );

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

export const logout = async (token: string) => {
  try {
    await prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  } catch (error) {
    // Ignore if token not found
  }
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: {
        select: {
          name: true,
          permissions: {
            select: {
              permission: {
                select: { slug: true },
              },
            },
          },
        },
      },
      deletedAt: true,
    },
  });

  if (!user || user.deletedAt) {
    throw new Error("User not found");
  }

  const permissions =
    user.role?.permissions.map((p) => p.permission.slug) || [];

  return { ...user, role: user.role?.name, permissions };
};

export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid old password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: "Password updated successfully" };
};
