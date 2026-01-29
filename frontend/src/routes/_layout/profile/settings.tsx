import { createFileRoute } from "@tanstack/react-router";

import SettingsPage from "@/pages/profile/settings.page";

export const Route = createFileRoute("/_layout/profile/settings")({
  component: SettingsPage,
});
