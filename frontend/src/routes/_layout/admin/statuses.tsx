import { createFileRoute } from "@tanstack/react-router";

import StatusesPage from "@/pages/admin/statuses.page";

export const Route = createFileRoute("/_layout/admin/statuses")({
  component: StatusesPage,
});
