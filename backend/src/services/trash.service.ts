import prisma from "../utils/prisma.js";
import { createLog } from "./log.service.js";
import {
  createPaginatedResponse,
  getPaginationParams,
} from "../utils/pagination.utils.js";

const VALID_TYPES = [
  "user",
  "ticket",
  "category",
  "status",
  "service",
  "priority",
];

export const getDeletedItems = async (type: string, query: any) => {
  if (!VALID_TYPES.includes(type)) {
    throw new Error("Invalid type");
  }

  const { skip, take, page, limit } = getPaginationParams(query);

  let model: any;
  let select: any = { id: true, deletedAt: true };

  switch (type) {
    case "user":
      model = prisma.user;
      select = { ...select, email: true, fullName: true };
      break;
    case "ticket":
      model = prisma.ticket;
      select = { ...select, title: true };
      break;
    case "category":
      model = prisma.category;
      select = { ...select, name: true };
      break;
    case "status":
      model = prisma.status;
      select = { ...select, name: true };
      break;
    case "service":
      model = prisma.service;
      select = { ...select, name: true };
      break;
    case "priority":
      model = prisma.priority;
      select = { ...select, name: true };
      break;
  }

  const [items, total] = await Promise.all([
    model.findMany({
      where: { deletedAt: { not: null } },
      select,
      orderBy: { deletedAt: "desc" },
      skip,
      take,
    }),
    model.count({ where: { deletedAt: { not: null } } }),
  ]);

  return createPaginatedResponse(items, total, page, limit);
};

// ... imports

// ... VALID_TYPES ...

export const deletePermanentItem = async (
  type: string,
  id: string,
  userId: string,
) => {
  if (!VALID_TYPES.includes(type)) {
    throw new Error("Invalid type");
  }

  let model: any;
  switch (type) {
    case "user":
      model = prisma.user;
      break;
    case "ticket":
      model = prisma.ticket;
      break;
    case "category":
      model = prisma.category;
      break;
    case "status":
      model = prisma.status;
      break;
    case "service":
      model = prisma.service;
      break;
    case "priority":
      model = prisma.priority;
      break;
  }

  // Hard delete
  const item = await model.delete({
    where: { id },
  });

  await createLog(
    userId,
    "Deleted Item Permanently",
    `Permanently deleted ${type} ${id}`,
    undefined, // ticketId
    undefined, // ipAddress
    undefined, // metadata
    "Warning", // Severity
  );

  return item;
};

export const restoreItem = async (type: string, id: string, userId: string) => {
  // ... existing code ...
  if (!VALID_TYPES.includes(type)) {
    throw new Error("Invalid type");
  }

  let model: any;
  switch (type) {
    case "user":
      model = prisma.user;
      break;
    case "ticket":
      model = prisma.ticket;
      break;
    case "category":
      model = prisma.category;
      break;
    case "status":
      model = prisma.status;
      break;
    case "service":
      model = prisma.service;
      break;
    case "priority":
      model = prisma.priority;
      break;
  }

  const item = await model.update({
    where: { id },
    data: { deletedAt: null },
  });

  const ticketId = type === "ticket" ? id : undefined;
  await createLog(userId, "Restored Item", `Restored ${type} ${id}`, ticketId);

  return item;
};
