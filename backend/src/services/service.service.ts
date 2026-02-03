import prisma from "../utils/prisma.js";
import { z } from "zod";
import {
  createPaginatedResponse,
  getPaginationParams,
} from "../utils/pagination.utils.js";
import {
  CreateServiceDTO,
  PaginationQueryParams,
  UpdateServiceDTO,
} from "../types/dtos.js";
import { createLog } from "./log.service.js";

const createServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const createService = async (
  data: CreateServiceDTO,
  performerId: string,
) => {
  const { name, description } = createServiceSchema.parse(data);

  const existingService = await prisma.service.findFirst({
    where: { name },
  });

  if (existingService) {
    throw new Error("Service with this name already exists");
  }

  const service = await prisma.service.create({
    data: {
      name,
      description,
    },
  });

  await createLog(
    performerId,
    "Created service",
    `Created service ${name}`,
    undefined,
  );

  return service;
};

export const getServices = async (query: PaginationQueryParams) => {
  const { skip, take, page, limit } = getPaginationParams(query);

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      skip,
      take,
    }),
    prisma.service.count({ where: { deletedAt: null } }),
  ]);

  return createPaginatedResponse(services, total, page, limit);
};

export const updateService = async (
  id: string,
  data: UpdateServiceDTO,
  performerId: string,
) => {
  const { name, description } = updateServiceSchema.parse(data);

  const service = await prisma.service.update({
    where: { id },
    data: {
      name,
      description,
    },
  });

  await createLog(
    performerId,
    "Updated service",
    `Updated service ${service.name}`,
    undefined,
  );

  return service;
};

export const deleteService = async (id: string, performerId: string) => {
  const service = await prisma.service.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createLog(
    performerId,
    "Deleted service",
    `Soft deleted service ${service.name}`,
    undefined,
  );

  return service;
};
