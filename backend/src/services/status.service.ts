import {
  CreateStatusDTO,
  PaginationQueryParams,
  UpdateStatusDTO,
} from "../types/dtos.js";
import prisma from "../utils/prisma.js";
import {
  createPaginatedResponse,
  getPaginationParams,
} from "../utils/pagination.utils.js";
import { createLog } from "./log.service.js";

export const getAllStatuses = async (query: PaginationQueryParams) => {
  const { skip, take, page, limit } = getPaginationParams(query);

  const [statuses, total] = await Promise.all([
    prisma.status.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      skip,
      take,
    }),
    prisma.status.count({ where: { deletedAt: null } }),
  ]);

  return createPaginatedResponse(statuses, total, page, limit);
};

export const getStatusById = async (id: string) => {
  const status = await prisma.status.findUnique({
    where: { id },
  });

  if (!status || status.deletedAt) {
    throw new Error("Status not found");
  }

  return status;
};

export const createStatus = async (
  data: CreateStatusDTO,
  performerId: string,
) => {
  const { name, description } = data;

  const existingStatus = await prisma.status.findFirst({
    where: { name },
  });

  if (existingStatus) {
    throw new Error("Status with this name already exists");
  }

  const status = await prisma.status.create({
    data: {
      name,
      description,
    },
  });

  await createLog(
    performerId,
    "Created status",
    `Created status ${name}`,
    undefined,
  );

  return status;
};

export const updateStatus = async (
  id: string,
  data: UpdateStatusDTO,
  performerId: string,
) => {
  const { name, description } = data;

  const status = await prisma.status.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
    },
  });

  await createLog(
    performerId,
    "Updated status",
    `Updated status ${status.name}`,
    undefined,
  );

  return status;
};

export const deleteStatus = async (id: string, performerId: string) => {
  const status = await prisma.status.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createLog(
    performerId,
    "Deleted status",
    `Soft deleted status ${status.name}`,
    undefined,
  );

  return status;
};
