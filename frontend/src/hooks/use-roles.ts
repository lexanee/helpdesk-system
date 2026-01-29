import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import api from "../lib/api";

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: {
    permission: {
      id: string;
      slug: string;
      description?: string;
    };
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  slug: string;
  description?: string;
}

const fetchRoles = async (): Promise<Role[]> => {
  const { data } = await api.get("/rbac/roles");
  return data.data; // API returns { data: Role[], meta: ... }
};

const fetchPermissions = async (): Promise<Permission[]> => {
  const { data } = await api.get("/rbac/permissions");
  return data;
};

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });
};

export const useAllPermissions = () => {
  return useQuery({
    queryKey: ["permissions-list"],
    queryFn: fetchPermissions,
    staleTime: 1000 * 60 * 60, // 1 hour (permissions rarely change)
  });
};

export const createRoleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(), // Assuming input is slugs for UI convenience
  permissionIds: z.array(z.string()).optional(), // But API technically takes IDs
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  permissionIds: z.array(z.string()).optional(),
});

// Since the API expects `permissionIds` but the schema might validate slugs for UI,
// we'll keep the DTOs simple or derive them from schema.
// However, the original code used `CreateRoleDTO` with `permissionIds`.
// Let's rely on `permissionIds` for the API payload.

export interface CreateRoleDTO {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleDTO) => api.post("/rbac/roles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDTO }) =>
      api.put(`/rbac/roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/rbac/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};
