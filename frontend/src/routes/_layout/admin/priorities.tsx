import { createFileRoute } from "@tanstack/react-router";

import { PriorityListPage } from "@/pages/admin/priority.page";

export const Route = createFileRoute("/_layout/admin/priorities")({
  component: PriorityListPage,
});
