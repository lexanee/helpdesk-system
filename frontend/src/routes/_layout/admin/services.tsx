import { createFileRoute } from "@tanstack/react-router";

import ServicesPage from "@/pages/admin/services.page";

export const Route = createFileRoute("/_layout/admin/services")({
  component: ServicesPage,
});
