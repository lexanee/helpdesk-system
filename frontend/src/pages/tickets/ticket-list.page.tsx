import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Group,
  Paper,
  Select,
  TextInput,
  Title,
} from "@mantine/core";
import { IconEye, IconPlus, IconSearch } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { type Column, DataTable } from "@/components/data-table";
import { AccessGuard } from "@/components/guards/access-guard";
import { type Category, useCategories } from "@/hooks/use-categories";
import { usePriorities } from "@/hooks/use-priorities";
import { type Status, useStatuses } from "@/hooks/use-statuses";
import { type Ticket, useTickets } from "@/hooks/use-tickets";

export default function TicketsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  const { data: ticketData, isLoading: loading } = useTickets({
    page,
    limit,
    statusId: statusFilter || undefined,
    categoryId: categoryFilter || undefined,
  });

  const tickets = ticketData?.data || [];
  const totalRecords = ticketData?.meta.total || 0;

  const { data: statusesData } = useStatuses({ limit: 1000 });
  const statuses: Status[] = statusesData?.data || [];

  const { data: categoriesData } = useCategories({ limit: 1000 });
  const categories: Category[] = categoriesData?.data || [];

  const { data: priorities = [] } = usePriorities();

  const getStatusName = (statusId: string) => {
    return statuses.find((s) => s.id === statusId)?.name || "Unknown";
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  const getUserName = (ticket: Ticket) => {
    if (!ticket.assignedTo) return "Unassigned";
    if (ticket.assignee)
      return ticket.assignee.fullName || ticket.assignee.email || "Unknown";
    return "Unknown";
  };

  // Client-side filtering for unsupported backend filters (Search & Priority)
  // Note: This only filters the current page, which is not ideal but matches current backend capabilities.
  const filteredTickets = tickets.filter((ticket: Ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      !priorityFilter || ticket.priority?.id === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "blue";
      case "In Progress":
        return "yellow";
      case "Resolved":
        return "green";
      case "Closed":
        return "gray";
      default:
        return "gray";
    }
  };

  const columns: Column<Ticket>[] = [
    { accessor: "title", title: "Title" },
    {
      accessor: "categoryId",
      title: "Category",
      render: (ticket) => getCategoryName(ticket.categoryId),
    },
    {
      accessor: "statusId",
      title: "Status",
      render: (ticket) => (
        <Badge color={getStatusColor(getStatusName(ticket.statusId))}>
          {getStatusName(ticket.statusId)}
        </Badge>
      ),
    },
    {
      accessor: "priority",
      title: "Priority",
      render: (ticket) => (
        <Badge color={ticket.priority?.color || "gray"}>
          {ticket.priority?.name || "Unknown"}
        </Badge>
      ),
    },
    {
      accessor: "assignedTo",
      title: "Assigned To",
      render: (ticket) => getUserName(ticket),
    },
    {
      accessor: "createdAt",
      title: "Created",
      render: (ticket) => new Date(ticket.createdAt).toLocaleDateString(),
    },
    {
      accessor: "actions",
      title: "Actions",
      render: (ticket) => (
        <ActionIcon
          variant="subtle"
          onClick={(e) => {
            e.stopPropagation();
            navigate({ to: `/tickets/${ticket.id}` });
          }}
        >
          <IconEye size={16} />
        </ActionIcon>
      ),
    },
  ];

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Tickets</Title>
        <AccessGuard permissions="ticket:create">
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate({ to: "/tickets/new" })}
          >
            Create Ticket
          </Button>
        </AccessGuard>
      </Group>

      <Paper withBorder p="md" mb="md">
        <Group gap="md">
          <TextInput
            placeholder="Search tickets..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Status"
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            data={[
              { value: "", label: "All Statuses" },
              ...statuses.map((s) => ({ value: s.id, label: s.name })),
            ]}
            clearable
          />
          <Select
            placeholder="Category"
            value={categoryFilter}
            onChange={(value) => {
              setCategoryFilter(value);
              setPage(1);
            }}
            data={[
              { value: "", label: "All Categories" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            clearable
          />
          <Select
            placeholder="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            data={[
              { value: "", label: "All Priorities" },
              ...priorities.map((p) => ({ value: p.id, label: p.name })),
            ]}
            clearable
          />
        </Group>
      </Paper>

      <DataTable
        data={filteredTickets}
        columns={columns}
        total={totalRecords} // Note: This total might be inaccurate due to client-side filtering
        page={page}
        limit={10}
        onPageChange={setPage}
        isLoading={loading}
        onRowClick={(ticket) => navigate({ to: `/tickets/${ticket.id}` })}
        socketEvent="tickets:list:update"
        socketRoom="tickets-list"
        queryKey={["tickets"]}
      />
    </Container>
  );
}
