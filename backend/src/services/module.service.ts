import prisma from "../utils/prisma.js";

export const getAllModules = async (includePermissions = true) => {
  return prisma.module.findMany({
    include: {
      permissions: includePermissions,
    },
    orderBy: {
      name: "asc",
    },
  });
};
