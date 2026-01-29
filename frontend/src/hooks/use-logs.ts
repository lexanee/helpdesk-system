import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import type { PaginatedResponse } from "@/types/api";

export interface Log {
  id: string;
  userId: string;
  action: string;
  details: string | null;
  ticketId: string | null;
  ipAddress: string | null;
  createdAt: string;
  user?: {
    id: string;
    fullName: string | null;
    email: string;
  };
  ticket?: {
    id: string;
    title: string;
  };
}

export const useLogs = (
  filters?: { ticketId?: string; userId?: string },
  page = 1,
  limit = 20,
) => {
  return useQuery<PaginatedResponse<Log>>({
    queryKey: ["logs", filters, page, limit],
    queryFn: async () => {
      const { data } = await api.get("/logs", {
        params: { ...filters, page, limit },
      });
      return data;
    },
  });
};
