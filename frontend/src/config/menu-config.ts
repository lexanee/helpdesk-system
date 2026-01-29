import type { IconProps } from "@tabler/icons-react";
import {
  IconActivity,
  IconBell,
  IconCategory,
  IconDashboard,
  IconDeviceDesktop,
  IconFlag,
  IconHistory,
  IconListCheck,
  IconLock,
  IconSettings,
  IconTags,
  IconTicket,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import React from "react";

export interface MenuItem {
  label: string;
  icon?: React.ComponentType<IconProps>;
  path?: string;
  roles?: string[];
  permissions?: string[];
  children?: MenuItem[];
  type?: "group" | "link" | "submenu";
}

export const menuConfig: MenuItem[] = [
  {
    label: "Dashboard",
    icon: IconDashboard,
    path: "/dashboard",
    type: "link",
    permissions: ["main:view_dashboard"],
  },
  {
    label: "Tickets",
    icon: IconTicket,
    path: "/tickets",
    type: "link",
    permissions: ["ticket:view"],
  },

  {
    label: "Activities",
    icon: IconActivity,
    path: "/histories/activities",
    type: "link",
    permissions: ["main:view_activities"],
  },
  {
    label: "Notifications",
    icon: IconBell,
    path: "/histories/notifications",
    type: "link",
    permissions: ["main:view_notifications"],
  },
  {
    label: "Active Sessions",
    icon: IconDeviceDesktop,
    path: "/profile/sessions",
    type: "link",
    permissions: ["main:view_sessions"],
  },
  {
    label: "Admin",
    icon: IconSettings,
    roles: ["administrator"],
    type: "submenu",
    children: [
      {
        label: "Categories",
        icon: IconCategory,
        path: "/admin/categories",
        type: "link",
        permissions: ["admin:manage_categories"],
      },
      {
        label: "Services",
        icon: IconListCheck,
        path: "/admin/services",
        type: "link",
        permissions: ["admin:manage_services"],
      },
      {
        label: "Priorities",
        icon: IconFlag,
        path: "/admin/priorities",
        type: "link",
        permissions: ["admin:manage_priorities"],
      },
      {
        label: "Statuses",
        icon: IconTags,
        path: "/admin/statuses",
        type: "link",
        permissions: ["admin:manage_statuses"],
      },
      {
        label: "Users",
        icon: IconUsers,
        path: "/admin/users",
        type: "link",
        permissions: ["admin:manage_users"],
      },
      {
        label: "Roles",
        icon: IconLock,
        path: "/admin/roles",
        type: "link",
        permissions: ["admin:manage_roles"],
      },
      {
        label: "Trash Bin",
        icon: IconTrash,
        path: "/admin/trash",
        type: "link",
        permissions: ["admin:manage_trash"],
      },
      {
        label: "Logs",
        icon: IconHistory,
        path: "/admin/logs",
        type: "link",
        permissions: ["admin:manage_logs"],
      },
    ],
  },
];
