import prisma from "../utils/prisma.js";

export const getAllPermissions = async () => {
  return prisma.permission.findMany({
    orderBy: { slug: "asc" },
  });
};
