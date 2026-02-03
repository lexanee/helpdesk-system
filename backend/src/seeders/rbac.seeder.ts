import prisma from "../utils/prisma.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("RBACSeeder");

// Modules and Permissions Definition
const MODULES = [
  {
    name: "Dashboard",
    description: "Main dashboard and overview",
    permissions: [
      { slug: "dashboard:view", description: "View dashboard" },
      { slug: "activities:view", description: "View activities" },
      { slug: "notifications:view", description: "View notifications" },
      { slug: "sessions:view", description: "View sessions" },
    ],
  },
  {
    name: "Ticket Management",
    description: "Manage helpdesk tickets",
    permissions: [
      { slug: "tickets:create", description: "Create new tickets" },
      { slug: "tickets:view", description: "View tickets" },
      { slug: "tickets:update", description: "Update ticket details" },
      { slug: "tickets:delete", description: "Delete tickets" },
      { slug: "tickets:assign", description: "Assign tickets to agents" },
      { slug: "tickets:change_status", description: "Change ticket status" },
    ],
  },
  {
    name: "User Management",
    description: "Manage users, roles, and permissions",
    permissions: [
      { slug: "users:view", description: "View users" },
      { slug: "users:manage", description: "Manage users" },
      { slug: "roles:manage", description: "Manage roles" },
      { slug: "permissions:manage", description: "Manage permissions" },
    ],
  },
  {
    name: "System Management",
    description: "Manage system configurations",
    permissions: [
      { slug: "categories:manage", description: "Manage categories" },
      { slug: "services:manage", description: "Manage services" },
      { slug: "priorities:manage", description: "Manage priorities" },
      { slug: "statuses:manage", description: "Manage statuses" },
      { slug: "trash:manage", description: "Manage trash" },
      { slug: "logs:manage", description: "Manage logs" },
    ],
  },
];

const ROLES = {
  administrator: {
    description: "Full system access",
    permissions: ["*"],
  },
  support_agent: {
    description: "Process tickets",
    permissions: [
      "tickets:create",
      "dashboard:view",
      "activities:view",
      "notifications:view",
      "sessions:view",
      "tickets:view",
      "tickets:update",
      "tickets:change_status",
      "tickets:assign",
    ],
  },
  customer: {
    description: "Create and view own tickets",
    permissions: [
      "dashboard:view",
      "activities:view",
      "notifications:view",
      "sessions:view",
      "tickets:create",
      "tickets:view",
      "tickets:update",
    ],
  },
};

export const seedRBAC = async () => {
  logger.info("Seeding RBAC...");

  const permissionMap = new Map();

  // 1. Create Modules and Permissions
  for (const m of MODULES) {
    const module = await prisma.module.upsert({
      where: { name: m.name },
      update: {},
      create: {
        name: m.name,
        description: m.description,
      },
    });

    for (const p of m.permissions) {
      const permission = await prisma.permission.upsert({
        where: { slug: p.slug },
        update: { moduleId: module.id }, // Assign to module
        create: {
          slug: p.slug,
          description: p.description,
          moduleId: module.id,
        },
      });
      permissionMap.set(p.slug, permission.id);
    }
  }

  // 2. Create Roles
  for (const [roleName, config] of Object.entries(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: config.description,
      },
    });

    // 3. Assign Permissions
    let permissionsToAssign: string[] = [];

    if (config.permissions.includes("*")) {
      permissionsToAssign = Array.from(permissionMap.values());
    } else {
      permissionsToAssign = config.permissions
        .map((slug) => permissionMap.get(slug))
        .filter((id) => id !== undefined);
    }

    // Clean up old permissions if needed, here we just upsert
    for (const permissionId of permissionsToAssign) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permissionId,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permissionId,
        },
      });
    }
  }
  logger.info("RBAC seeded successfully.");
};
