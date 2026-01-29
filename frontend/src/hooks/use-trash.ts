import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";
import type { PaginationQueryParams } from "@/types/api";

type TrashType = "users" | "tickets" | "services" | "categories" | "statuses" | "priorities";

interface TrashQueryParams extends PaginationQueryParams {
  // Add any specific filters if needed
}

// Helper to map plural to singular for API (if API expects singular)
// Based on previous code, API expects "singular" (e.g. "user", "ticket") in param
const getSingularType = (type: string) => {
  const map: Record<string, string> = {
    tickets: "ticket",
    users: "user",
    services: "service",
    categories: "category",
    statuses: "status",
    priorities: "priority",
  };
  return map[type] || type;
};

export const useTrash = (type: TrashType, query?: TrashQueryParams) => {
  const singularType = getSingularType(type);
  
  return useQuery({
    queryKey: ["trash", type, query],
    queryFn: async () => {
      const { data } = await api.get(`/trash/${singularType}`, { params: query });
      return data;
    },
    enabled: !!type,
  });
};

export const useRestoreItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, id }: { type: TrashType; id: string }) => {
      const singularType = getSingularType(type);
      await api.post(`/trash/${singularType}/${id}/restore`);
    },
    onSuccess: (_, { type }) => {
      notifications.show({
        title: "Success",
        message: "Item restored successfully",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["trash"] });
      // Invalidate the main list of the restored type
      queryClient.invalidateQueries({ queryKey: [type] });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to restore item",
        color: "red",
      });
    },
  });
};

export const useDeletePermanent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, id }: { type: TrashType; id: string }) => {
      const singularType = getSingularType(type);
      await api.delete(`/trash/${singularType}/${id}`);
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Item permanently deleted",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["trash"] });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to delete item",
        color: "red",
      });
    },
  });
};
