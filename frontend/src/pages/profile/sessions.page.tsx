import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";

interface Session {
  id: string;
  userAgent: string | null;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data } = await api.get("/sessions");
      return data;
    },
  });

  const revokeSession = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sessions/${id}`);
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Session revoked",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const revokeAllSessions = useMutation({
    mutationFn: async () => {
      await api.delete("/sessions");
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "All other sessions revoked",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const getDeviceIcon = (userAgent: string | null) => {
    if (userAgent?.toLowerCase().includes("mobile")) {
      return <IconDeviceMobile size={24} />;
    }
    return <IconDeviceDesktop size={24} />;
  };

  if (isLoading) {
    return <Text>Loading sessions...</Text>;
  }

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Active Sessions</Title>
        <Button
          color="red"
          variant="light"
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to revoke all other sessions?",
              )
            ) {
              revokeAllSessions.mutate();
            }
          }}
          loading={revokeAllSessions.isPending}
        >
          Revoke All Other Sessions
        </Button>
      </Group>

      <Stack>
        {sessions.map((session: Session) => (
          <Paper key={session.id} withBorder p="md">
            <Group justify="space-between">
              <Group>
                {getDeviceIcon(session.userAgent)}
                <div>
                  <Group gap="xs">
                    <Text fw={500}>{session.ipAddress}</Text>
                    {session.isCurrent && (
                      <Badge color="green">Current Device</Badge>
                    )}
                  </Group>
                  <Text size="sm" c="dimmed" lineClamp={1}>
                    {session.userAgent}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Started: {new Date(session.createdAt).toLocaleString()}
                  </Text>
                </div>
              </Group>

              {!session.isCurrent && (
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => revokeSession.mutate(session.id)}
                  loading={revokeSession.isPending}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              )}
            </Group>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}
