import {
  ActionIcon,
  Button,
  Container,
  Group,
  Modal,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

import { type Column, DataTable } from "@/components/data-table";
import { usePermission } from "@/hooks/use-permission";
import {
  type Status,
  useCreateStatus,
  useDeleteStatus,
  useStatuses,
  useUpdateStatus,
} from "@/hooks/use-statuses";

export default function StatusesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: statusesData, isLoading } = useStatuses({ page, limit });
  const statuses = statusesData?.data || [];
  const totalRecords = statusesData?.meta.total || 0;

  const createStatus = useCreateStatus();
  const updateStatus = useUpdateStatus();
  const deleteStatus = useDeleteStatus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
    },
    validate: {
      name: (value) => (value.length < 1 ? "Name is required" : null),
    },
  });

  const { hasPermission } = usePermission();

  if (!hasPermission("statuses:manage")) {
    return (
      <Container>
        <Text>Access Denied</Text>
      </Container>
    );
  }

  const handleOpenModal = (status?: Status) => {
    if (status) {
      setEditingId(status.id);
      form.setValues({
        name: status.name,
      });
    } else {
      setEditingId(null);
      form.reset();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingId) {
        await updateStatus.mutateAsync({ id: editingId, ...values });
        notifications.show({
          title: "Success",
          message: "Status updated",
          color: "green",
        });
      } else {
        await createStatus.mutateAsync(values);
        notifications.show({
          title: "Success",
          message: "Status created",
          color: "green",
        });
      }
      setIsModalOpen(false);
      form.reset();
    } catch {
      notifications.show({
        title: "Error",
        message: "Operation failed",
        color: "red",
      });
    }
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: "Delete Status",
      children: <Text>Are you sure? This cannot be undone.</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteStatus.mutateAsync(id);
          notifications.show({
            title: "Success",
            message: "Status deleted",
            color: "green",
          });
        } catch {
          notifications.show({
            title: "Error",
            message: "Failed to delete",
            color: "red",
          });
        }
      },
    });
  };

  const columns: Column<Status>[] = [
    {
      accessor: "name",
      title: "Name",
      render: (status) => status.name,
    },
    {
      accessor: "actions",
      title: "Actions",
      render: (status) => (
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            title="Edit Status"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(status);
            }}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            title="Delete Status"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(status.id);
            }}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Statuses</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => handleOpenModal()}
        >
          Add Status
        </Button>
      </Group>

      <DataTable
        data={statuses}
        columns={columns}
        total={totalRecords}
        page={page}
        limit={10}
        onPageChange={setPage}
        isLoading={isLoading}
        queryKey={["statuses"]}
      />

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Status" : "New Status"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Name"
            required
            {...form.getInputProps("name")}
            mb="md"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createStatus.isPending || updateStatus.isPending}
            >
              {editingId ? "Update" : "Create"}
            </Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
