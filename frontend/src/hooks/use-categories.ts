import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import api from "../lib/api";
import type { PaginatedResponse } from "../types/api";

// Types
export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

// API Functions
const fetchCategories = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Category>> => {
  const { data } = await api.get("/categories", { params });
  return data;
};

const fetchCategoryById = async (id: string): Promise<Category> => {
  const { data } = await api.get(`/categories/${id}`);
  return data;
};

const createCategory = async (
  category: z.infer<typeof createCategorySchema>,
) => {
  const { data } = await api.post("/categories", category);
  return data;
};

const updateCategory = async ({
  id,
  ...category
}: { id: string } & z.infer<typeof updateCategorySchema>) => {
  const { data } = await api.patch(`/categories/${id}`, category);
  return data;
};

const deleteCategory = async (id: string) => {
  await api.delete(`/categories/${id}`);
};

// Hooks
export const useCategories = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => fetchCategories(params),
    staleTime: 1000 * 60 * 10, // 10 minutes (categories don't change often)
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => fetchCategoryById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
