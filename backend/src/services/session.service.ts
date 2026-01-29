import prisma from "../utils/prisma.js";
import { createLog } from "./log.service.js";

export const getSessions = async (userId: string) => {
  return prisma.refreshToken.findMany({
    where: { userId, revoked: false },
    orderBy: { lastActiveAt: "desc" },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      lastActiveAt: true,
      createdAt: true,
    },
  });
};

export const revokeSession = async (
  id: string,
  userId: string,
  userAgent?: string,
  ipAddress?: string,
) => {
  const session = await prisma.refreshToken.findUnique({ where: { id } });
  if (!session || session.userId !== userId) {
    throw new Error("Session not found");
  }

  await prisma.refreshToken.update({
    where: { id },
    data: { revoked: true },
  });

  await createLog(
    userId,
    "Revoked Session",
    `Revoked session ${id}`,
    undefined,
    ipAddress,
    undefined,
    "Warning",
    userAgent,
  );

  return { message: "Session revoked" };
};

export const revokeAllSessions = async (
  userId: string,
  userAgent?: string,
  ipAddress?: string,
) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });

  await createLog(
    userId,
    "Revoked All Sessions",
    "Revoked all active sessions",
    undefined,
    ipAddress,
    undefined,
    "Critical",
    userAgent,
  );

  return { message: "All sessions revoked" };
};
