import {
  Badge,
  Button,
  Container,
  Group,
  Loader,
  Pagination,
  Paper,
  ScrollArea,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconCheck,
  IconInfoCircle,
  IconMessage,
  IconTicket,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";

import {
  type Notification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from "@/hooks/use-notifications";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications(page, 10);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  if (isLoading) return <Loader />;

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
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Notifications</Title>
        {unreadCount > 0 && (
          <Button
            variant="light"
            leftSection={<IconCheck size={16} />}
            onClick={() => markAllAsRead.mutate()}
            loading={markAllAsRead.isPending}
          >
            Mark All as Read
          </Button>
        )}
      </Group>
      <Paper withBorder>
        <ScrollArea>
          <Table miw={800}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Type</Table.Th>
                <Table.Th>Title</Table.Th>
                <Table.Th>Message</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.data?.map((notification: Notification) => (
                <Table.Tr
                  key={notification.id}
                  style={{ opacity: notification.isRead ? 0.6 : 1 }}
                >
                  <Table.Td>
                    <ThemeIcon size="md" variant="light" radius="xl">
                      {getIcon(notification.type)}
                    </ThemeIcon>
                  </Table.Td>
                  <Table.Td>
                    {notification.link ? (
                      <Text
                        component={Link}
                        to={notification.link}
                        c="blue"
                        onClick={() =>
                          !notification.isRead &&
                          markAsRead.mutate(notification.id)
                        }
                      >
                        {notification.title}
                      </Text>
                    ) : (
                      notification.title
                    )}
                  </Table.Td>
                  <Table.Td>{notification.message}</Table.Td>
                  <Table.Td>
                    {dayjs(notification.createdAt).format("MMM D, YYYY h:mm A")}
                  </Table.Td>
                  <Table.Td>
                    {notification.isRead ? (
                      <Badge color="gray">Read</Badge>
                    ) : (
                      <Badge color="green">Unread</Badge>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        <Group justify="center" p="md">
          <Pagination
            total={data?.meta?.totalPages || 1}
            value={page}
            onChange={setPage}
          />
        </Group>
      </Paper>
    </Container>
  );
}
