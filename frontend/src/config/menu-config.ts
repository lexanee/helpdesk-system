import type { IconProps } from "@tabler/icons-react";
import {
  IconActivity,
  IconBell,
  IconCategory,
  IconDashboard,
  IconDeviceDesktop,
  IconFlag,
  IconHistory,
  IconId,
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
    permissions: ["dashboard:view"],
  },
  {
    label: "Tickets",
    icon: IconTicket,
    path: "/tickets",
    type: "link",
    permissions: ["tickets:view"],
  },

  {
    label: "Activities",
    icon: IconActivity,
    path: "/histories/activities",
    type: "link",
    permissions: ["activities:view"],
  },
  {
    label: "Notifications",
    icon: IconBell,
    path: "/histories/notifications",
    type: "link",
    permissions: ["notifications:view"],
  },
  {
    label: "Active Sessions",
    icon: IconDeviceDesktop,
    path: "/profile/sessions",
    type: "link",
    permissions: ["sessions:view"],
  },
  {
    label: "Users Management",
    icon: IconUsers,
    type: "submenu",
    children: [
      {
        label: "Users",
        icon: IconUsers,
        path: "/admin/users",
        type: "link",
        permissions: ["users:manage"],
      },
      {
        label: "Roles",
        icon: IconId,
        path: "/admin/roles",
        type: "link",
        permissions: ["roles:manage"],
      },
      {
        label: "Permissions",
        icon: IconLock,
        path: "/admin/permissions",
        type: "link",
        permissions: ["permissions:manage"],
      },
    ],
  },
  {
    label: "System Management",
    icon: IconSettings,
    type: "submenu",
    children: [
      {
        label: "Categories",
        icon: IconCategory,
        path: "/admin/categories",
        type: "link",
        permissions: ["categories:manage"],
      },
      {
        label: "Services",
        icon: IconListCheck,
        path: "/admin/services",
        type: "link",
        permissions: ["services:manage"],
      },
      {
        label: "Priorities",
        icon: IconFlag,
        path: "/admin/priorities",
        type: "link",
        permissions: ["priorities:manage"],
      },
      {
        label: "Statuses",
        icon: IconTags,
        path: "/admin/statuses",
        type: "link",
        permissions: ["statuses:manage"],
      },
      {
        label: "Trash Bin",
        icon: IconTrash,
        path: "/admin/trash",
        type: "link",
        permissions: ["trash:manage"],
      },
      {
        label: "Logs",
        icon: IconHistory,
        path: "/admin/logs",
        type: "link",
        permissions: ["logs:manage"],
      },
    ],
  },
];
