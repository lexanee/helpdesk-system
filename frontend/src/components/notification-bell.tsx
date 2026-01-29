import {
  ActionIcon,
  Group,
  Indicator,
  Menu,
  ScrollArea,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { notifications as mantineNotifications } from "@mantine/notifications";
import {
  IconBell,
  IconInfoCircle,
  IconMessage,
  IconTicket,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";

import { useSocket } from "@/context/socket-context";
import {
  type Notification as AppNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from "@/hooks/use-notifications";

export function NotificationBell() {
  const { data } = useNotifications(1, 5); // Fetch top 5 for dropdown
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (socket) {
      socket.on("notification:new", (notification: AppNotification) => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        mantineNotifications.show({
          title: notification.title,
          message: notification.message,
          color: "blue",
        });
      });

      return () => {
        socket.off("notification:new");
      };
    }
  }, [socket, queryClient]);

  const unreadCount = data?.meta?.unreadCount || 0;

  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return <IconMessage size={16} />;
      case "assignment":
        return <IconTicket size={16} />;
      default:
        return <IconInfoCircle size={16} />;
    }
  };

  return (
    <Menu shadow="md" width={300} position="bottom-end" withinPortal={false}>
      <Menu.Target>
        <Indicator
          inline
          label={unreadCount}
          size={16}
          disabled={unreadCount === 0}
          color="red"
        >
          <ActionIcon variant="subtle" size="lg">
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Group justify="space-between">
            <Text size="xs">Notifications</Text>
            {unreadCount > 0 && (
              <Text
                size="xs"
                c="blue"
                style={{ cursor: "pointer" }}
                onClick={() => markAllAsRead.mutate()}
              >
                Mark all as read
              </Text>
            )}
          </Group>
        </Menu.Label>
        <ScrollArea.Autosize mah={300}>
          {data?.data?.length === 0 ? (
            <Menu.Item disabled>No notifications</Menu.Item>
          ) : (
            data?.data?.map((notification: AppNotification) => (
              <Menu.Item
                key={notification.id}
                component={Link}
                to={notification.link || "#"}
                onClick={() =>
                  !notification.isRead && markAsRead.mutate(notification.id)
                }
                style={{ opacity: notification.isRead ? 0.6 : 1 }}
              >
                <Group wrap="nowrap">
                  <ThemeIcon size="md" variant="light" radius="xl">
                    {getIcon(notification.type)}
                  </ThemeIcon>
                  <div>
                    <Text size="sm" fw={500}>
                      {notification.title}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={2}>
                      {notification.message}
                    </Text>
                  </div>
                </Group>
              </Menu.Item>
            ))
          )}
        </ScrollArea.Autosize>
        <Menu.Divider />
        <Menu.Item component={Link} to="/histories/notifications" ta="center">
          View all notifications
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
