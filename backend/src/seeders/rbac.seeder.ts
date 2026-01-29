import prisma from "../utils/prisma.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("RBACSeeder");

const PERMISSIONS = [
  // Main Access
  { slug: "main:view_dashboard", description: "View dashboard" },
  { slug: "main:view_activities", description: "View activities" },
  { slug: "main:view_notifications", description: "View notifications" },
  { slug: "main:view_sessions", description: "View sessions" },

  // Tickets Access
  { slug: "ticket:create", description: "Create new tickets" },
  { slug: "ticket:view", description: "View tickets" },
  { slug: "ticket:update", description: "Update ticket details" },
  { slug: "ticket:delete", description: "Delete tickets" },
  { slug: "ticket:assign_to_agent", description: "Assign tickets to agents" },
  { slug: "ticket:change_status", description: "Change ticket status" },

  // Admin Access
  { slug: "admin:manage_categories", description: "Manage categories" },
  { slug: "admin:manage_services", description: "Manage services" },
  { slug: "admin:manage_priorities", description: "Manage priorities" },
  { slug: "admin:manage_statuses", description: "Manage statuses" },
  { slug: "admin:manage_users", description: "Manage users" },
  { slug: "admin:manage_roles", description: "Manage roles" },
  { slug: "admin:manage_trash", description: "Manage trash" },
  { slug: "admin:manage_logs", description: "Manage logs" },
];

const ROLES = {
  administrator: {
    description: "Full system access",
    permissions: ["*"], // Special case for all permissions
  },
  support_agent: {
    description: "Process tickets",
    permissions: [
      "main:view_dashboard",
      "main:view_activities",
      "main:view_notifications",
      "main:view_sessions",
      "ticket:view",
      "ticket:update",
      "ticket:change_status",
    ],
  },
  customer: {
    description: "Create and view own tickets",
    permissions: [
      "main:view_dashboard",
      "main:view_activities",
      "main:view_notifications",
      "main:view_sessions",
      "ticket:create",
      "ticket:view",
      "ticket:update",
    ],
  },
};

export const seedRBAC = async () => {
  logger.info("Seeding RBAC...");

  // 1. Create Permissions
  const permissionMap = new Map();
  for (const p of PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
    permissionMap.set(p.slug, permission.id);
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
