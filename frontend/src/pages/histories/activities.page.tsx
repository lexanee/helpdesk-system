import { Container, Loader, Title } from "@mantine/core";
import dayjs from "dayjs";
import { useState } from "react";

import { type Column, DataTable } from "@/components/data-table";
import { useAuth } from "@/hooks/use-auth";
import { type Log, useLogs } from "@/hooks/use-logs";

export default function ActivitiesPage() {
  const { data: user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Explicitly pass userId to ensure we only get current user's logs, even if admin
  const { data, isLoading } = useLogs({ userId: user?.id || "" }, page, limit);
  const logs: Log[] = data?.data || [];
  const totalRecords = data?.meta?.total || 0;

  const columns: Column<Log>[] = [
    { accessor: "action", title: "Action" },
    {
      accessor: "details",
      title: "Details",
      render: (log) => log.details || "-",
    },
    {
      accessor: "ticketId",
      title: "Ticket",
      render: (log) => log.ticket?.title || "-",
    },
    {
      accessor: "createdAt",
      title: "Date",
      render: (log) => dayjs(log.createdAt).format("MMM D, YYYY h:mm A"),
    },
    {
      accessor: "ipAddress",
      title: "IP Address",
      render: (log) => log.ipAddress || "-",
    },
  ];

  if (isLoading) return <Loader />;

  return (
    <Container size="xl">
      <Title order={2} mb="xl">
        Activities
      </Title>
      <DataTable
        data={logs}
        columns={columns}
        total={totalRecords}
        page={page}
        limit={10}
        onPageChange={setPage}
        isLoading={isLoading}
        queryKey={["logs", user?.id || ""]}
      />
    </Container>
  );
}
