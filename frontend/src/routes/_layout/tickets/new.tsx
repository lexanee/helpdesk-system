import { createFileRoute } from "@tanstack/react-router";

import CreateTicketPage from "@/pages/tickets/create-ticket.page";

export const Route = createFileRoute("/_layout/tickets/new")({
  component: CreateTicketPage,
});
