import bcrypt from "bcrypt";
import prisma from "../utils/prisma.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("UserSeeder");

export const seedUsers = async () => {
  logger.info("Seeding Users...");

  // Fetch Roles
  const adminRole = await prisma.role.findUnique({
    where: { name: "administrator" },
  });
  const agentRole = await prisma.role.findUnique({
    where: { name: "support_agent" },
  });
  const customerRole = await prisma.role.findUnique({
    where: { name: "customer" },
  });

  if (!adminRole || !agentRole || !customerRole) {
    throw new Error(
      "Roles must be seeded before users. Please run RBAC seeder first.",
    );
  }

  const adminPassword = await bcrypt.hash("adminadmin", 10);
  const customerPassword = await bcrypt.hash("customer", 10);

  const users = [
    // Admin
    {
      email: "admin@helpdesk.com",
      fullName: "System Administrator",
      password: adminPassword,
      roleId: adminRole.id,
    },
    // Support Agents
    {
      email: "agent1@helpdesk.com",
      fullName: "Support Agent 1",
      password: adminPassword,
      roleId: agentRole.id,
    },
    {
      email: "agent2@helpdesk.com",
      fullName: "Support Agent 2",
      password: adminPassword,
      roleId: agentRole.id,
    },
    {
      email: "agent3@helpdesk.com",
      fullName: "Support Agent 3",
      password: adminPassword,
      roleId: agentRole.id,
    },
    // Customers
    {
      email: "customer1@email.com",
      fullName: "John Doe",
      password: customerPassword,
      roleId: customerRole.id,
    },
    {
      email: "customer2@email.com",
      fullName: "Jane Smith",
      password: customerPassword,
      roleId: customerRole.id,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        fullName: user.fullName,
        password: user.password,
        roleId: user.roleId,
        deletedAt: null, // Ensure user is active
      },
      create: {
        id: crypto.randomUUID(),
        email: user.email,
        fullName: user.fullName,
        password: user.password,
        roleId: user.roleId,
      },
    });
  }

  logger.info("Users seeded successfully.");
};
