import { createFileRoute } from "@tanstack/react-router";

import ActivitiesPage from "@/pages/histories/activities.page";

export const Route = createFileRoute("/_layout/histories/activities")({
  component: ActivitiesPage,
});
