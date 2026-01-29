import prisma from "../utils/prisma.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("StatusSeeder");

const STATUSES = [
  { name: "Open", description: "New ticket" },
  { name: "In Progress", description: "Being worked on" },
  { name: "Resolved", description: "Issue fixed" },
  { name: "Closed", description: "Ticket archived" },
];

export const seedStatuses = async () => {
  logger.info("Seeding Statuses...");
  for (const s of STATUSES) {
    await prisma.status.upsert({
      where: { name: s.name },
      update: { description: s.description },
      create: s,
    });
  }
  logger.info("Statuses seeded successfully.");
};
