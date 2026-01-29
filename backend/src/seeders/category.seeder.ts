import prisma from "../utils/prisma.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("CategorySeeder");

const CATEGORIES = [
  {
    name: "Technical Support",
    description: "General hardware/software issues",
  },
  { name: "Bug Report", description: "System errors/glitches" },
  { name: "Feature Request", description: "New capabilities" },
  { name: "Account & Access", description: "Login, permissions" },
  { name: "General Inquiry", description: "Questions, other" },
];

export const seedCategories = async () => {
  logger.info("Seeding Categories...");
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: { description: c.description },
      create: c,
    });
  }
  logger.info("Categories seeded successfully.");
};
