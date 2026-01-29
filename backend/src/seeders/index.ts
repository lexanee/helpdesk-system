import prisma from "../utils/prisma.js";
import { seedCategories } from "./category.seeder.js";
import { seedPriorities } from "./priority.seeder.js";
import { seedRBAC } from "./rbac.seeder.js";
import { seedStatuses } from "./status.seeder.js";
import { seedUsers } from "./user.seeder.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("Seeder");

const main = async () => {
  try {
    await seedRBAC();
    await seedPriorities();
    await seedCategories();
    await seedStatuses();
    await seedUsers();
    logger.info("All seeding completed.");
  } catch (e) {
    logger.error("Seeding failed:", { error: e });
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();

