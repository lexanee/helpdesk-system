import { createFileRoute } from "@tanstack/react-router";

import { RoleListPage } from "@/pages/admin/role.page";

export const Route = createFileRoute("/_layout/admin/roles")({
  component: RoleListPage,
});
