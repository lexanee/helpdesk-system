import { createFileRoute, Outlet } from "@tanstack/react-router";

import { GuestGuard } from "@/components/guards/guest-guard";

export const Route = createFileRoute("/_auth")({
  component: () => (
    <GuestGuard>
      <Outlet />
    </GuestGuard>
  ),
});
