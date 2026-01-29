import { createFileRoute } from "@tanstack/react-router";

import CategoriesPage from "@/pages/admin/categories.page";

export const Route = createFileRoute("/_layout/admin/categories")({
  component: CategoriesPage,
});
