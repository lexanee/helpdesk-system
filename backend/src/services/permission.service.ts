import prisma from "../utils/prisma.js";
import { z } from "zod";
import { createLog } from "./log.service.js";
import { PaginationQueryParams } from "../types/dtos.js";
import {
  createPaginatedResponse,
  getPaginationParams,
} from "../utils/pagination.utils.js";

// Validation Schemas
const createPermissionSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
});

const updatePermissionSchema = z.object({
  slug: z.string().min(1, "Slug is required").optional(),
  description: z.string().optional(),
});

export const getAllPermissions = async (query: PaginationQueryParams) => {
  const { skip, take, page, limit } = getPaginationParams(query);

  const [permissions, total] = await Promise.all([
    prisma.permission.findMany({
      orderBy: { slug: "asc" },
      skip,
      take,
    }),
    prisma.permission.count(),
  ]);

  return createPaginatedResponse(permissions, total, page, limit);
};

export const getPermissionById = async (id: string) => {
  const permission = await prisma.permission.findUnique({
    where: { id },
  });

  if (!permission) {
    throw new Error("Permission not found");
  }
  return permission;
};

export const createPermission = async (
  data: z.infer<typeof createPermissionSchema>,
  userId: string,
) => {
  const { slug, description } = createPermissionSchema.parse(data);

  const existing = await prisma.permission.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("Permission already exists");
  }

  const permission = await prisma.permission.create({
    data: { slug, description },
  });

  await createLog(
    userId,
    "Created Permission",
    `Created permission ${slug}`,
    undefined,
  );
  return permission;
};

export const updatePermission = async (
  id: string,
  data: z.infer<typeof updatePermissionSchema>,
  userId: string,
) => {
  const { slug, description } = updatePermissionSchema.parse(data);

  const permission = await prisma.permission.findUnique({ where: { id } });
  if (!permission) {
    throw new Error("Permission not found");
  }

  if (slug && slug !== permission.slug) {
    const existing = await prisma.permission.findUnique({ where: { slug } });
    if (existing) {
      throw new Error("Permission slug already exists");
    }
  }

  const updated = await prisma.permission.update({
    where: { id },
    data: { slug, description },
  });

  await createLog(
    userId,
    "Updated Permission",
    `Updated permission ${permission.slug} to ${updated.slug}`,
    undefined,
  );
  return updated;
};

export const deletePermission = async (id: string, userId: string) => {
  const permission = await prisma.permission.findUnique({
    where: { id },
    include: { _count: { select: { roles: true } } },
  });

  if (!permission) {
    throw new Error("Permission not found");
  }

  if (permission._count.roles > 0) {
    throw new Error("Cannot delete permission assigned to roles");
  }

  await prisma.permission.delete({ where: { id } });

  await createLog(
    userId,
    "Deleted Permission",
    `Deleted permission ${permission.slug}`,
    undefined,
  );
  return permission;
};
