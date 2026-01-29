import { Code, Container, Loader, Text, TextInput, Title } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import dayjs from "dayjs";
import { useState } from "react";

import { type Column, DataTable } from "@/components/data-table";
import { type Log, useLogs } from "@/hooks/use-logs";
import { usePermission } from "@/hooks/use-permission";

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [debouncedUserId] = useDebouncedValue(userIdFilter, 500);
  const { hasPermission } = usePermission();

  const { data, isLoading } = useLogs(
    { userId: debouncedUserId || undefined },
    page,
    limit,
  );
  const logs: Log[] = data?.data || [];
  const totalRecords = data?.meta?.total || 0;

  const columns: Column<Log>[] = [
    {
      accessor: "userId",
      title: "User",
      render: (log) => (
        <div>
          <Text size="sm">{log.user?.fullName || "Unknown"}</Text>
          <Text size="xs" c="dimmed">
            {log.user?.email}
          </Text>
        </div>
      ),
    },
    { accessor: "action", title: "Action" },
    {
      accessor: "ticketId",
      title: "Ticket",
      render: (log) => log.ticket?.title || log.ticketId || "-",
    },
    {
      accessor: "details",
      title: "Details",
      render: (log) => <Code block>{log.details || "-"}</Code>,
    },
    {
      accessor: "createdAt",
      title: "Date",
      render: (log) => dayjs(log.createdAt).format("MMM D, YYYY h:mm A"),
    },
  ];

  if (isLoading) return <Loader />;

  if (!hasPermission("admin:manage_logs")) {
    return (
      <Container>
        <Text>Access Denied</Text>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Title order={2} mb="md">
        System Logs
      </Title>
      <TextInput
        placeholder="Filter by User ID"
        value={userIdFilter}
        onChange={(event) => setUserIdFilter(event.currentTarget.value)}
        mb="md"
      />
      <DataTable
        data={logs}
        columns={columns}
        total={totalRecords}
        page={page}
        limit={10}
        onPageChange={setPage}
        isLoading={isLoading}
        queryKey={["logs", debouncedUserId]}
      />
    </Container>
  );
}
