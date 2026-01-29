import {
  AppShell,
  Avatar,
  Burger,
  Group,
  Menu,
  NavLink,
  ScrollArea,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconLogout, IconUser } from "@tabler/icons-react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { menuConfig } from "@/config/menu-config";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { usePermission } from "@/hooks/use-permission";

import { NotificationBell } from "./notification-bell";

export default function AppLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { data: user, isError, isLoading } = useAuth();
  const { hasPermission, hasRole } = usePermission();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isError) {
      navigate({ to: "/login" });
    }
  }, [isError, navigate]);

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate({ to: "/login" });
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Text size="xl" fw={700}>
              IT Helpdesk
            </Text>
          </Group>

          <Group>
            <NotificationBell />
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Avatar color="blue" radius="xl" size="sm">
                      {user?.fullName?.charAt(0) ||
                        user?.email?.charAt(0) ||
                        "U"}
                    </Avatar>
                    <div style={{ flex: 1 }} className="hidden sm:block">
                      <Text size="sm" fw={500} visibleFrom="sm">
                        {user?.fullName || user?.email}
                      </Text>
                      <Text size="xs" c="dimmed" visibleFrom="sm">
                        {user?.role?.replace("_", " ")}
                      </Text>
                    </div>
                    <IconChevronDown size={16} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconUser size={16} />}
                  component={Link}
                  to="/profile/settings"
                >
                  Profile
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={16} />}
                  color="red"
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          {menuConfig.map((item, index) => {
            // Use the new hook for permission checks
            const isVisible = item.permissions
              ? hasPermission(item.permissions)
              : hasRole(item.roles);

            if (!isVisible) return null;

            if (item.type === "group") {
              // Filter children based on permissions
              const visibleChildren = item.children?.filter((child) =>
                child.permissions
                  ? hasPermission(child.permissions)
                  : hasRole(child.roles),
              );

              if (!visibleChildren || visibleChildren.length === 0) return null;

              return (
                <div key={index} className="mb-2">
                  <Text
                    size="xs"
                    fw={500}
                    c="dimmed"
                    mb={4}
                    mt={index > 0 ? 10 : 0}
                  >
                    {item.label}
                  </Text>
                  {visibleChildren.map((child) => (
                    <NavLink
                      key={child.path}
                      active={location.pathname === child.path}
                      label={child.label}
                      leftSection={child.icon && <child.icon size={20} />}
                      component={Link}
                      to={child.path}
                      onClick={toggle}
                    />
                  ))}
                </div>
              );
            }

            if (item.type === "submenu") {
              // Filter children based on permissions
              const visibleChildren = item.children?.filter((child) =>
                child.permissions
                  ? hasPermission(child.permissions)
                  : hasRole(child.roles),
              );

              if (!visibleChildren || visibleChildren.length === 0) return null;

              return (
                <NavLink
                  key={index}
                  label={item.label}
                  leftSection={item.icon && <item.icon size={20} />}
                  childrenOffset={28}
                  defaultOpened={visibleChildren.some(
                    (child) => location.pathname === child.path,
                  )}
                >
                  {visibleChildren.map((child) => (
                    <NavLink
                      key={child.path}
                      active={location.pathname === child.path}
                      label={child.label}
                      leftSection={child.icon && <child.icon size={20} />}
                      component={Link}
                      to={child.path}
                      onClick={toggle}
                    />
                  ))}
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.path}
                active={location.pathname === item.path}
                label={item.label}
                leftSection={item.icon && <item.icon size={20} />}
                component={Link}
                to={item.path}
                onClick={toggle}
              />
            );
          })}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
