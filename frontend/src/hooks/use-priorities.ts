import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import api from "../lib/api";

export interface Priority {
  id: string;
  name: string;
  level: number;
  color: string;
  isDefault: boolean;
}

export const createPrioritySchema = z.object({
  name: z.string().min(1, "Name is required"),
  level: z.number().int().min(1, "Level must be at least 1"),
  color: z.string().min(1, "Color is required"),
});

export const updatePrioritySchema = z.object({
  name: z.string().min(1).optional(),
  level: z.number().int().min(1).optional(),
  color: z.string().min(1).optional(),
});

const fetchPriorities = async (): Promise<Priority[]> => {
  const { data } = await api.get("/priorities");
  return data;
};

export const usePriorities = () => {
  return useQuery({
    queryKey: ["priorities"],
    queryFn: fetchPriorities,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreatePriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: z.infer<typeof createPrioritySchema>) =>
      api.post("/priorities", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priorities"] });
    },
  });
};

export const useUpdatePriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: z.infer<typeof updatePrioritySchema>;
    }) => api.put(`/priorities/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priorities"] });
    },
  });
};

export const useDeletePriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/priorities/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priorities"] });
    },
  });
};
