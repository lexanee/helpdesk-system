import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import api from "../lib/api";

// Types
export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: "customer" | "support_agent" | "administrator";
  permissions: string[];
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
  role: z.enum(["customer", "support_agent", "administrator"]).optional(),
});

// API Functions
const fetchProfile = async (): Promise<User> => {
  const { data } = await api.get("/auth/me");
  return data;
};

const login = async (credentials: z.infer<typeof loginSchema>) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

const register = async (credentials: z.infer<typeof registerSchema>) => {
  const { data } = await api.post("/auth/register", credentials);
  return data;
};

const logout = async () => {
  await api.post("/auth/logout");
};

// Hooks
export const useAuth = () => {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: fetchProfile,
    retry: false, // Don't retry if 401
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throwOnError: (error: any) => {
      const status = error.response?.status;
      return status !== 401 && status !== 403;
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      // Set the user data immediately
      queryClient.setQueryData(["auth", "user"], data.user);
      // Also invalidate to trigger a refetch
      await queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: register,
    onSuccess: async (data) => {
      // Set the user data immediately
      queryClient.setQueryData(["auth", "user"], data.user);
      // Also invalidate to trigger a refetch
      await queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.clear();
    },
  });
};

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

const changePassword = async (data: z.infer<typeof changePasswordSchema>) => {
  const { data: response } = await api.post("/auth/change-password", {
    oldPassword: data.oldPassword,
    newPassword: data.newPassword,
  });
  return response;
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};
