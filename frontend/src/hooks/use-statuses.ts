import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import api from "../lib/api";
import type { PaginatedResponse } from "../types/api";

// Types
export interface Status {
  id: string;
  name: string;
  description: string | null;
}

export const createStatusSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const updateStatusSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

// API Functions
const fetchStatuses = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Status>> => {
  const { data } = await api.get("/statuses", { params });
  return data;
};

const fetchStatusById = async (id: string): Promise<Status> => {
  const { data } = await api.get(`/statuses/${id}`);
  return data;
};

const createStatus = async (status: z.infer<typeof createStatusSchema>) => {
  const { data } = await api.post("/statuses", status);
  return data;
};

const updateStatus = async ({
  id,
  ...status
}: { id: string } & z.infer<typeof updateStatusSchema>) => {
  const { data } = await api.patch(`/statuses/${id}`, status);
  return data;
};

const deleteStatus = async (id: string) => {
  await api.delete(`/statuses/${id}`);
};

// Hooks
export const useStatuses = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["statuses", params],
    queryFn: () => fetchStatuses(params),
    staleTime: 1000 * 60 * 10, // 10 minutes (statuses don't change often)
  });
};

export const useStatus = (id: string) => {
  return useQuery({
    queryKey: ["statuses", id],
    queryFn: () => fetchStatusById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
    },
  });
};

export const useUpdateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
    },
  });
};

export const useDeleteStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
    },
  });
};
