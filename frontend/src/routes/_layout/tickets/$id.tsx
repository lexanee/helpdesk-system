import { createFileRoute } from "@tanstack/react-router";

import TicketDetailPage from "@/pages/tickets/ticket-detail.page";

export const Route = createFileRoute("/_layout/tickets/$id")({
  component: TicketDetailPage,
});
