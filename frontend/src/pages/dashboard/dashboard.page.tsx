import { BarChart } from "@mantine/charts";
import {
  Badge,
  Button,
  Center,
  Container,
  Grid,
  Group,
  Paper,
  RingProgress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconPlus,
  IconTicket,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";

import { useCategories } from "@/hooks/use-categories";
import { usePriorities } from "@/hooks/use-priorities";
import { useStatuses } from "@/hooks/use-statuses";
import { useTickets } from "@/hooks/use-tickets";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: ticketsData, isLoading: ticketsLoading } = useTickets({
    limit: 1000,
  });
  const tickets = ticketsData?.data || [];

  const { data: statusesData } = useStatuses({ limit: 1000 });
  const statuses = statusesData?.data || [];

  const { data: categoriesData } = useCategories({ limit: 1000 });
  const categories = categoriesData?.data || [];

  const getStatusName = (statusId: string) => {
    return statuses.find((s) => s.id === statusId)?.name || "Unknown";
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  const openTickets = tickets.filter((t) => {
    const status = getStatusName(t.statusId);
    return status === "Open" || status === "In Progress";
  });

  const resolvedTickets = tickets.filter(
    (t) => getStatusName(t.statusId) === "Resolved",
  );
  const closedTickets = tickets.filter(
    (t) => getStatusName(t.statusId) === "Closed",
  );
  const { data: priorities = [] } = usePriorities();

  const urgentTickets = tickets.filter((t) => t.priority?.name === "Urgent");

  const categoryData = categories.map((cat) => ({
    category: cat.name,
    count: tickets.filter((t) => t.categoryId === cat.id).length,
  }));

  const priorityData = priorities.map((p) => ({
    priority: p.name,
    count: tickets.filter((t) => t.priorityId === p.id).length,
  }));

  const completionRate =
    tickets.length > 0 ? (closedTickets.length / tickets.length) * 100 : 0;

  if (ticketsLoading) {
    return (
      <Center h={400}>
        <Text>Loading dashboard...</Text>
      </Center>
    );
  }

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Dashboard</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate({ to: "/tickets/new" })}
        >
          Create Ticket
        </Button>
      </Group>

      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper withBorder p="md" radius="md">
            <Group>
              <IconTicket size={24} color="blue" />
              <div>
                <Text size="xs" c="dimmed">
                  Total Tickets
                </Text>
                <Text size="xl" fw={700}>
                  {tickets.length}
                </Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper withBorder p="md" radius="md">
            <Group>
              <IconClock size={24} color="orange" />
              <div>
                <Text size="xs" c="dimmed">
                  Open Tickets
                </Text>
                <Text size="xl" fw={700}>
                  {openTickets.length}
                </Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper withBorder p="md" radius="md">
            <Group>
              <IconCheck size={24} color="green" />
              <div>
                <Text size="xs" c="dimmed">
                  Resolved Tickets
                </Text>
                <Text size="xl" fw={700}>
                  {resolvedTickets.length}
                </Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper withBorder p="md" radius="md">
            <Group>
              <IconAlertCircle size={24} color="red" />
              <div>
                <Text size="xs" c="dimmed">
                  Urgent Tickets
                </Text>
                <Text size="xl" fw={700}>
                  {urgentTickets.length}
                </Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="md">
              <Text fw={600}>Tickets by Category</Text>
            </Group>
            <BarChart
              h={300}
              data={categoryData}
              dataKey="category"
              series={[{ name: "count", color: "blue.6" }]}
            />
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="md">
              <Text fw={600}>Tickets by Priority</Text>
            </Group>
            <BarChart
              h={300}
              data={priorityData}
              dataKey="priority"
              series={[{ name: "count", color: "orange.6" }]}
            />
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md">
            <Text fw={600} mb="md">
              Completion Rate
            </Text>
            <Center>
              <RingProgress
                size={200}
                sections={[{ value: completionRate, color: "blue" }]}
                label={
                  <Center>
                    <Text fw={700} size="xl">
                      {completionRate.toFixed(1)}%
                    </Text>
                  </Center>
                }
              />
            </Center>
            <Text size="sm" c="dimmed" ta="center" mt="md">
              {closedTickets.length} of {tickets.length} tickets closed
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md">
            <Text fw={600} mb="md">
              Recent Tickets
            </Text>
            <Stack gap="xs">
              {tickets.slice(0, 5).map((ticket) => (
                <Paper
                  key={ticket.id}
                  p="sm"
                  withBorder
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate({ to: `/tickets/${ticket.id}` })}
                >
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={500}>
                        {ticket.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {getCategoryName(ticket.categoryId)}
                      </Text>
                    </div>
                    <Badge color={ticket.priority?.color || "gray"}>
                      {ticket.priority?.name || "Unknown"}
                    </Badge>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
