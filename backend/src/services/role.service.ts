import prisma from "../utils/prisma.js";
import { z } from "zod";
import { createLog } from "./log.service.js";
import {
  CreateRoleDTO,
  PaginationQueryParams,
  UpdateRoleDTO,
} from "../types/dtos.js";
import {
  createPaginatedResponse,
  getPaginationParams,
} from "../utils/pagination.utils.js";

const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissionIds: z.array(z.string().uuid()),
});

const updateRoleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

export const getRoles = async (query: PaginationQueryParams) => {
  const { skip, take, page, limit } = getPaginationParams(query);

  const [roles, total] = await Promise.all([
    prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
      orderBy: { name: "asc" },
      skip,
      take,
    }),
    prisma.role.count(),
  ]);

  return createPaginatedResponse(roles, total, page, limit);
};

export const getRoleById = async (id: string) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  });

  if (!role) {
    throw new Error("Role not found");
  }
  return role;
};

export const createRole = async (data: CreateRoleDTO, userId: string) => {
  const { name, description, permissionIds } = createRoleSchema.parse(data);

  const role = await prisma.role.create({
    data: {
      name,
      description,
      permissions: {
        create: permissionIds.map((id) => ({ permissionId: id })),
      },
    },
    include: { permissions: true },
  });

  await createLog(userId, "Created Role", `Created role ${name}`, undefined);
  return role;
};

export const updateRole = async (
  id: string,
  data: UpdateRoleDTO,
  userId: string,
) => {
  const { name, description, permissionIds } = updateRoleSchema.parse(data);

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) {
    throw new Error("Role not found");
  }

  // Transaction to update role and permissions
  const updatedRole = await prisma.$transaction(async (tx) => {
    await tx.role.update({
      where: { id },
      data: { name, description },
    });

    if (permissionIds) {
      // Delete existing
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      // Create new
      await tx.rolePermission.createMany({
        data: permissionIds.map((pid) => ({
          roleId: id,
          permissionId: pid,
        })),
      });
    }

    return tx.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  });

  await createLog(
    userId,
    "Updated Role",
    `Updated role ${name || role.name}`,
    undefined,
  );
  return updatedRole;
};

export const deleteRole = async (id: string, userId: string) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });

  if (!role) {
    throw new Error("Role not found");
  }

  if (role._count.users > 0) {
    throw new Error("Cannot delete role assigned to users");
  }

  await prisma.role.delete({ where: { id } });
  await createLog(
    userId,
    "Deleted Role",
    `Deleted role ${role.name}`,
    undefined,
  );
  return role;
};
