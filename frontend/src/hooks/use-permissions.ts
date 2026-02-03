import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import api from "../lib/api";

export interface Permission {
  id: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

import type { PaginationQueryParams } from "@/types/api";

const fetchPermissions = async (params?: PaginationQueryParams) => {
  const { data } = await api.get("/rbac/permissions", { params });
  return data;
};

export const usePermissions = (params?: PaginationQueryParams) => {
  return useQuery({
    queryKey: ["permissions", params],
    queryFn: () => fetchPermissions(params),
  });
};

export const createPermissionSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
});

export const updatePermissionSchema = z.object({
  slug: z.string().min(1, "Slug is required").optional(),
  description: z.string().optional(),
});

export type CreatePermissionDTO = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionDTO = z.infer<typeof updatePermissionSchema>;

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePermissionDTO) =>
      api.post("/rbac/permissions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      // Also invalidate the list used by roles if different
      queryClient.invalidateQueries({ queryKey: ["permissions-list"] });
    },
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePermissionDTO }) =>
      api.put(`/rbac/permissions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      queryClient.invalidateQueries({ queryKey: ["permissions-list"] });
    },
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/rbac/permissions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      queryClient.invalidateQueries({ queryKey: ["permissions-list"] });
    },
  });
};
