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
  role: z.string().min(1, "Role is required"),
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
  ...data
}: { id: string } & z.infer<typeof updateUserRoleSchema>) => {
  const { data: response } = await api.patch(`/users/${id}/role`, data);
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

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
