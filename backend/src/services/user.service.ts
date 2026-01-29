import { CreateUserDTO, PaginationQueryParams, UpdateUserDTO } from "../types/dtos.js";

import bcrypt from "bcryptjs";
import {
  createPaginatedResponse,
  getPaginationParams,
} from "../utils/pagination.utils.js";
import prisma from "../utils/prisma.js";
import { createLog } from "./log.service.js";

export const getAllUsers = async (query: PaginationQueryParams) => {
  const { skip, take, page, limit } = getPaginationParams(query);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.user.count({ where: { deletedAt: null } }),
  ]);

  return createPaginatedResponse(users, total, page, limit);
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: { select: { id: true, name: true } },
      createdAt: true,
      deletedAt: true,
    },
  });

  if (!user || user.deletedAt) {
    throw new Error("User not found");
  }

  return user;
};

export const createUser = async (data: CreateUserDTO) => {
  const { email, password, fullName, roleId } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Provide default password if not supplied (e.g. for manually created users)
  // In a real app, maybe generate one or require it. Assuming required for now or handled by frontend.
  const finalPassword = password || "DefaultPass123!"; 
  const hashedPassword = await bcrypt.hash(finalPassword, 10);

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      fullName,
      roleId,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: { select: { id: true, name: true } },
      createdAt: true,
    },
  });

  return user;
};

export const updateUser = async (id: string, data: UpdateUserDTO) => {
  const { email, fullName, roleId, password } = data;

  const updateData: UpdateUserDTO = { email, fullName, roleId };
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      fullName: true,
      role: { select: { id: true, name: true } },
      createdAt: true,
    },
  });

  return user;
};

export const updateUserRole = async (
  id: string,
  roleId: string,
  performerId: string,
  ipAddress?: string,
) => {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new Error("Role not found");

  const user = await prisma.user.update({
    where: { id },
    data: { roleId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: { select: { id: true, name: true } },
    },
  });

  await createLog(
    performerId,
    "Updated user role",
    `Updated user ${user.email} role to ${role.name}`,
    undefined,
    ipAddress,
  );

  return user;
};

export const deleteUser = async (
  id: string,
  performerId: string,
  ipAddress?: string,
) => {
  const user = await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createLog(
    performerId,
    "Deleted user",
    `Soft deleted user ${user.email}`,
    undefined,
    ipAddress,
  );

  return user;
};
