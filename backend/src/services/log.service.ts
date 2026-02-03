import { PaginationQueryParams } from "../types/dtos.js";
import prisma from "../utils/prisma.js";
import {
  createPaginatedResponse,
  getPaginationParams,
} from "../utils/pagination.utils.js";

export const createLog = async (
  userId: string,
  action: string,
  details?: string,
  ticketId?: string,
  ipAddress?: string,
  metadata?: any,
  severity: "Info" | "Warning" | "Critical" = "Info",
  userAgent?: string,
) => {
  return prisma.activityLog.create({
    data: {
      userId,
      action,
      details,
      ticketId,
      ipAddress,
      metadata,
      severity,
      userAgent,
    },
  });
};

export const getLogs = async (
  query: PaginationQueryParams,
  filters: { userId?: string; ticketId?: string } = {},
) => {
  const { skip, take, page, limit } = getPaginationParams(query);
  const where = filters;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        ticket: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return createPaginatedResponse(logs, total, page, limit);
};
