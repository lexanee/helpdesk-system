import { createFileRoute } from "@tanstack/react-router";

import NotificationsPage from "@/pages/histories/notifications.page";

export const Route = createFileRoute("/_layout/histories/notifications")({
  component: NotificationsPage,
});
