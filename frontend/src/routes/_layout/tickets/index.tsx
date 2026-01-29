import { createFileRoute } from "@tanstack/react-router";

import TicketListPage from "@/pages/tickets/ticket-list.page";

export const Route = createFileRoute("/_layout/tickets/")({
  component: TicketListPage,
});
