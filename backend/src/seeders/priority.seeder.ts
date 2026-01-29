import prisma from "../utils/prisma.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("PrioritySeeder");

const PRIORITIES = [
  { name: "Low", level: 1, color: "#4caf50", isDefault: false },
  { name: "Medium", level: 2, color: "#2196f3", isDefault: true },
  { name: "High", level: 3, color: "#ff9800", isDefault: false },
  { name: "Urgent", level: 4, color: "#f44336", isDefault: false },
];

export const seedPriorities = async () => {
  logger.info("Seeding Priorities...");
  for (const p of PRIORITIES) {
    await prisma.priority.upsert({
      where: { name: p.name },
      update: {
        level: p.level,
        color: p.color,
        isDefault: p.isDefault,
      },
      create: p,
    });
  }
  logger.info("Priorities seeded successfully.");
};
