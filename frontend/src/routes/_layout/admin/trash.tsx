import { createFileRoute } from "@tanstack/react-router";

import TrashPage from "@/pages/admin/trash.page";

export const Route = createFileRoute("/_layout/admin/trash")({
  component: TrashPage,
});
