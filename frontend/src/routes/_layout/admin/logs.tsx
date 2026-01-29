import { createFileRoute } from "@tanstack/react-router";

import LogsPage from "@/pages/admin/logs.page";

export const Route = createFileRoute("/_layout/admin/logs")({
  component: LogsPage,
});
