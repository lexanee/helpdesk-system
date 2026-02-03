import { useQuery } from "@tanstack/react-query";

import api from "../lib/api";

export interface Permission {
  id: string;
  slug: string;
  description: string;
  moduleId: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

const fetchModules = async () => {
  const { data } = await api.get<Module[]>("/modules");
  return data;
};

export const useModules = () => {
  return useQuery({
    queryKey: ["modules"],
    queryFn: fetchModules,
  });
};
