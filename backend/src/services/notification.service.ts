import prisma from "../utils/prisma.js";
import { emitNotification } from "./socket.service.js";
import { PaginationQueryParams } from "../types/dtos.js";
import {
  createPaginatedResponse,
  getPaginationParams,
} from "../utils/pagination.utils.js";

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string,
  link?: string,
) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
    },
  });

  emitNotification(userId, notification);

  return notification;
};

export const getUserNotifications = async (
  userId: string,
  query: PaginationQueryParams,
) => {
  const { skip, take, page, limit } = getPaginationParams(query);

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  const response = createPaginatedResponse(notifications, total, page, limit);
  return {
    ...response,
    meta: {
      ...response.meta,
      unreadCount,
    },
  };
};

export const markAsRead = async (id: string, userId: string) => {
  return prisma.notification.update({
    where: { id, userId }, // Ensure user owns notification
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
