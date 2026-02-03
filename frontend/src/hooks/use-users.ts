import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import api from "../lib/api";
import type { PaginatedResponse } from "../types/api";

// Types
export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: { name: string };
  createdAt: string;
}

export const updateUserRoleSchema = z.object({
  roleId: z.string().min(1, "Role is required"),
});

// API Functions
const fetchUsers = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<User>> => {
  const { data } = await api.get("/users", { params });
  return data;
};

const fetchUserById = async (id: string): Promise<User> => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

const updateUserRole = async ({
  id,
  roleId,
}: {
  id: string;
  roleId: string;
}) => {
  const { data: response } = await api.patch(`/users/${id}/role`, { roleId });
  return response;
};

const deleteUser = async (id: string) => {
  await api.delete(`/users/${id}`);
};

// Hooks
export const useUsers = (
  params?: { page?: number; limit?: number },
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => fetchUsers(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: options?.enabled,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => fetchUserById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const createUserSchema = z.object({
  email: z.string().email("Invalid email"),
  fullName: z.string().min(1, "Full name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleId: z.string().min(1, "Role is required"),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email").optional(),
  fullName: z.string().min(1, "Full name is required").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  roleId: z.string().min(1, "Role is required").optional(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

const createUser = async (data: CreateUserDTO) => {
  const { data: response } = await api.post("/users", data);
  return response;
};

const updateUser = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateUserDTO;
}) => {
  const { data: response } = await api.put(`/users/${id}`, data);
  return response;
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
