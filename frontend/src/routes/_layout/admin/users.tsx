import { createFileRoute } from "@tanstack/react-router";

import UsersPage from "@/pages/admin/users.page";

export const Route = createFileRoute("/_layout/admin/users")({
  component: UsersPage,
});
