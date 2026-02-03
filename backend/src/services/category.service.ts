import {
  CreateCategoryDTO,
  PaginationQueryParams,
  UpdateCategoryDTO,
} from "../types/dtos.js";
import prisma from "../utils/prisma.js";
import {
  createPaginatedResponse,
  getPaginationParams,
} from "../utils/pagination.utils.js";
import { createLog } from "./log.service.js";

export const getAllCategories = async (query: PaginationQueryParams) => {
  const { skip, take, page, limit } = getPaginationParams(query);

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      skip,
      take,
    }),
    prisma.category.count({ where: { deletedAt: null } }),
  ]);

  return createPaginatedResponse(categories, total, page, limit);
};

export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category || category.deletedAt) {
    throw new Error("Category not found");
  }

  return category;
};

export const createCategory = async (
  data: CreateCategoryDTO,
  performerId: string,
) => {
  const { name, description } = data;

  const existingCategory = await prisma.category.findFirst({
    where: { name },
  });

  if (existingCategory) {
    throw new Error("Category with this name already exists");
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
    },
  });

  await createLog(
    performerId,
    "Created category",
    `Created category ${name}`,
    undefined,
  );

  return category;
};

export const updateCategory = async (
  id: string,
  data: UpdateCategoryDTO,
  performerId: string,
) => {
  const { name, description } = data;

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
    },
  });

  await createLog(
    performerId,
    "Updated category",
    `Updated category ${category.name}`,
    undefined,
  );

  return category;
};

export const deleteCategory = async (id: string, performerId: string) => {
  const category = await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createLog(
    performerId,
    "Deleted category",
    `Soft deleted category ${category.name}`,
    undefined,
  );

  return category;
};
