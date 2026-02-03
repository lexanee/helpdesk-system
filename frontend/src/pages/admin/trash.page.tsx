import { ActionIcon, Container, Group, Tabs, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconRefresh, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

import { DataTable } from "@/components/data-table";
import { usePermission } from "@/hooks/use-permission";
import {
  useDeletePermanent,
  useRestoreItem,
  useTrash,
} from "@/hooks/use-trash";

// Define TrashType based on the hook's expectation
type TrashType =
  | "tickets"
  | "users"
  | "services"
  | "categories"
  | "statuses"
  | "priorities";

export default function TrashPage() {
  const [activeTab, setActiveTab] = useState<TrashType>("tickets");
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Hook Usage
  const { data, isLoading } = useTrash(activeTab, {
    page,
    limit,
  });

  // Extract items and meta
  const items = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const restoreMutation = useRestoreItem();
  const deletePermanentMutation = useDeletePermanent();

  interface DeletedItem {
    id: string;
    title?: string;
    fullName?: string;
    name?: string;
    deletedAt: string;
  }

  const handleRestore = (item: DeletedItem) => {
    modals.openConfirmModal({
      title: "Restore Item",
      children: (
        <Text size="sm">Are you sure you want to restore this item?</Text>
      ),
      labels: { confirm: "Restore", cancel: "Cancel" },
      confirmProps: { color: "green" },
      onConfirm: () => restoreMutation.mutate({ type: activeTab, id: item.id }),
    });
  };

  const handleDeletePermanent = (item: DeletedItem) => {
    modals.openConfirmModal({
      title: "Delete Permanently",
      children: (
        <Text size="sm">
          Are you sure you want to <b>permanently delete</b> this item? This
          action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete Permanently", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () =>
        deletePermanentMutation.mutate({ type: activeTab, id: item.id }),
    });
  };

  const columns = [
    {
      accessor: "title",
      title: "Name/Title",
      render: (item: DeletedItem) =>
        item.title || item.fullName || item.name || "Unknown",
    },
    {
      accessor: "deletedAt",
      title: "Deleted At",
      render: (item: DeletedItem) => new Date(item.deletedAt).toLocaleString(),
    },
    {
      accessor: "actions",
      title: "Actions",
      render: (item: DeletedItem) => (
        <Group gap="xs">
          <ActionIcon
            color="green"
            variant="subtle"
            title="Restore"
            onClick={() => handleRestore(item)}
            loading={
              restoreMutation.isPending &&
              restoreMutation.variables?.id === item.id
            }
          >
            <IconRefresh size={16} />
          </ActionIcon>

          <ActionIcon
            color="red"
            variant="subtle"
            title="Delete Permanently"
            onClick={() => handleDeletePermanent(item)}
            loading={
              deletePermanentMutation.isPending &&
              deletePermanentMutation.variables?.id === item.id
            }
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  const { hasPermission } = usePermission();

  if (!hasPermission("trash:manage")) {
    return (
      <Container>
        <Text>Access Denied</Text>
      </Container>
    );
  }

  return (
    <>
      <Title order={2} mb="xl">
        Trash Bin
      </Title>

      <Tabs
        value={activeTab}
        onChange={(val) => {
          setActiveTab(val as TrashType);
          setPage(1); // Reset page on tab change
        }}
        mb="md"
      >
        <Tabs.List>
          <Tabs.Tab value="tickets">Tickets</Tabs.Tab>
          <Tabs.Tab value="users">Users</Tabs.Tab>
          <Tabs.Tab value="services">Services</Tabs.Tab>
          <Tabs.Tab value="categories">Categories</Tabs.Tab>
          <Tabs.Tab value="statuses">Statuses</Tabs.Tab>
          <Tabs.Tab value="priorities">Priorities</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <DataTable
        data={items}
        columns={columns}
        isLoading={isLoading}
        total={meta.total}
        page={page}
        limit={limit}
        onPageChange={setPage}
      />
    </>
  );
}
