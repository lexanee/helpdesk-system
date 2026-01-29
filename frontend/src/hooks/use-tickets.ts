import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import api from "../lib/api";
import type { PaginatedResponse } from "../types/api";

// Types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  statusId: string;
  priorityId: string | null;
  priority?: { id: string; name: string; color: string; level: number };
  createdBy: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string };
  status?: { id: string; name: string };
  service?: { id: string; name: string };
  creator?: { id: string; email: string; fullName: string | null };
  assignee?: { id: string; email: string; fullName: string | null };
}

export const createTicketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
  priorityId: z.string().uuid().optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  categoryId: z.string().uuid().optional(),
  statusId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  priorityId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional().nullable(),
});

// API Functions
const fetchTickets = async (params?: {
  page?: number;
  limit?: number;
  statusId?: string;
  categoryId?: string;
  assignedTo?: string;
}): Promise<PaginatedResponse<Ticket>> => {
  const { data } = await api.get("/tickets", { params });
  return data;
};

const fetchTicketById = async (id: string): Promise<Ticket> => {
  const { data } = await api.get(`/tickets/${id}`);
  return data;
};

const createTicket = async (formData: FormData) => {
  const { data } = await api.post("/tickets", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const updateTicket = async ({
  id,
  ...ticket
}: { id: string } & z.infer<typeof updateTicketSchema>) => {
  const { data } = await api.put(`/tickets/${id}`, ticket);
  return data;
};

const deleteTicket = async (id: string) => {
  await api.delete(`/tickets/${id}`);
};

// Hooks
export const useTickets = (params?: {
  page?: number;
  limit?: number;
  statusId?: string;
  categoryId?: string;
  assignedTo?: string;
}) => {
  return useQuery({
    queryKey: ["tickets", params],
    queryFn: () => fetchTickets(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ["tickets", id],
    queryFn: () => fetchTicketById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTicket,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({
        queryKey: ["tickets", variables.id],
      });
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

// Message Types & Hooks
export interface Message {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: { id: string; email: string; fullName: string | null };
  attachments?: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string;
  }[];
}

const fetchMessages = async (ticketId: string): Promise<Message[]> => {
  const { data } = await api.get(`/tickets/${ticketId}/messages`);
  return data;
};

const createMessage = async ({
  ticketId,
  formData,
}: {
  ticketId: string;
  formData: FormData;
}) => {
  const { data } = await api.post(`/tickets/${ticketId}/messages`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const useMessages = (ticketId: string) => {
  return useQuery({
    queryKey: ["messages", ticketId],
    queryFn: () => fetchMessages(ticketId),
    enabled: !!ticketId,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMessage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.ticketId],
      });
      queryClient.invalidateQueries({
        queryKey: ["tickets", variables.ticketId],
      });
    },
  });
};
