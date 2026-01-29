import { createFileRoute } from "@tanstack/react-router";

import SessionsPage from "@/pages/profile/sessions.page";

export const Route = createFileRoute("/_layout/profile/sessions")({
  component: SessionsPage,
});
