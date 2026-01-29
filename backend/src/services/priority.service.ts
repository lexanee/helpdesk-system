import prisma from "../utils/prisma.js";
import { z } from "zod";
import { CreatePriorityDTO, UpdatePriorityDTO } from "../types/dtos.js";
import { createLog } from "./log.service.js";

const createPrioritySchema = z.object({
  name: z.string().min(1),
  level: z.number().int().min(1),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  isDefault: z.boolean().optional(),
});

const updatePrioritySchema = z.object({
  name: z.string().min(1).optional(),
  level: z.number().int().min(1).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  isDefault: z.boolean().optional(),
});

export const getPriorities = async () => {
  return prisma.priority.findMany({
    where: { deletedAt: null },
    orderBy: { level: "asc" },
  });
};

export const getPriorityById = async (id: string) => {
  const priority = await prisma.priority.findUnique({ where: { id } });
  if (!priority) {
    throw new Error("Priority not found");
  }
  return priority;
};

export const createPriority = async (
  data: CreatePriorityDTO,
  userId: string,
) => {
  const validatedData = createPrioritySchema.parse(data);

  // If setting as default, unset others
  if (validatedData.isDefault) {
    await prisma.priority.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }

  const priority = await prisma.priority.create({ data: validatedData });

  await createLog(
    userId,
    "Created Priority",
    `Created priority ${priority.name}`,
    undefined,
  );

  return priority;
};

export const updatePriority = async (
  id: string,
  data: UpdatePriorityDTO,
  userId: string,
) => {
  const validatedData = updatePrioritySchema.parse(data);

  // If setting as default, unset others
  if (validatedData.isDefault) {
    await prisma.priority.updateMany({
      where: { isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const priority = await prisma.priority.update({
    where: { id },
    data: validatedData,
  });

  await createLog(
    userId,
    "Updated Priority",
    `Updated priority ${priority.name}`,
    undefined,
  );

  return priority;
};

export const deletePriority = async (id: string, userId: string) => {
  const priority = await prisma.priority.findUnique({
    where: { id },
    include: { _count: { select: { tickets: true } } },
  });

  if (!priority) {
    throw new Error("Priority not found");
  }

  if (priority._count.tickets > 0) {
    throw new Error("Cannot delete priority used by tickets");
  }

  await prisma.priority.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createLog(
    userId,
    "Deleted Priority",
    `Deleted priority ${priority.name}`,
    undefined,
  );

  return priority;
};
