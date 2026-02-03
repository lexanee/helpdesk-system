import { createFileRoute } from "@tanstack/react-router";

import { PermissionsPage } from "@/pages/admin/permissions.page";

export const Route = createFileRoute("/_layout/admin/permissions")({
  component: PermissionsPage,
});
