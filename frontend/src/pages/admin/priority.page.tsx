import {
  ActionIcon,
  Badge,
  Button,
  ColorInput,
  Container,
  Group,
  Modal,
  NumberInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

import { type Column, DataTable } from "@/components/data-table";
import { usePermission } from "@/hooks/use-permission";
import {
  type Priority,
  useCreatePriority,
  useDeletePriority,
  usePriorities,
  useUpdatePriority,
} from "@/hooks/use-priorities";

export function PriorityListPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingPriority, setEditingPriority] = useState<Priority | null>(null);

  const { data: prioritiesData, isLoading } = usePriorities();
  const priorities = Array.isArray(prioritiesData) ? prioritiesData : [];

  const createPriority = useCreatePriority();
  const updatePriority = useUpdatePriority();
  const deletePriority = useDeletePriority();

  const { hasPermission } = usePermission();

  const form = useForm({
    initialValues: {
      name: "",
      level: 1,
      color: "#000000",
    },
    validate: {
      name: (value) => (value.length < 1 ? "Name is required" : null),
      level: (value) => (value < 1 ? "Level must be at least 1" : null),
      color: (value) => (value.length < 1 ? "Color is required" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingPriority) {
        await updatePriority.mutateAsync({
          id: editingPriority.id,
          data: values,
        });
        notifications.show({
          title: "Success",
          message: "Priority updated successfully",
          color: "green",
        });
      } else {
        await createPriority.mutateAsync(values);
        notifications.show({
          title: "Success",
          message: "Priority created successfully",
          color: "green",
        });
      }
      close();
      form.reset();
      setEditingPriority(null);
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to save priority",
        color: "red",
      });
    }
  };

  const handleEdit = (priority: Priority) => {
    setEditingPriority(priority);
    form.setValues({
      name: priority.name,
      level: priority.level,
      color: priority.color,
    });
    open();
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: "Delete Priority",
      children: "Are you sure you want to delete this priority?",
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deletePriority.mutateAsync(id);
          notifications.show({
            title: "Success",
            message: "Priority deleted successfully",
            color: "green",
          });
        } catch {
          notifications.show({
            title: "Error",
            message: "Failed to delete priority",
            color: "red",
          });
        }
      },
    });
  };

  if (!hasPermission("admin:manage_priorities")) {
    return (
      <Container>
        <Text>Access Denied</Text>
      </Container>
    );
  }

  const columns: Column<Priority>[] = [
    { accessor: "name", title: "Name" },
    { accessor: "level", title: "Level" },
    {
      accessor: "color",
      title: "Color",
      render: (priority) => (
        <Badge color={priority.color}>{priority.color}</Badge>
      ),
    },
    {
      accessor: "actions",
      title: "Actions",
      render: (priority) => (
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            title="Edit Priority"
            onClick={() => handleEdit(priority)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            title="Delete Priority"
            onClick={() => handleDelete(priority.id)}
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
        <Title order={2}>Priorities</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            setEditingPriority(null);
            form.reset();
            open();
          }}
        >
          Create Priority
        </Button>
      </Group>

      <DataTable
        columns={columns}
        data={priorities}
        isLoading={isLoading}
        total={priorities.length}
        page={page}
        limit={limit}
        onPageChange={setPage}
      />

      <Modal
        opened={opened}
        onClose={close}
        title={editingPriority ? "Edit Priority" : "Create Priority"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Name"
            placeholder="Priority Name"
            {...form.getInputProps("name")}
            required
            mb="sm"
          />
          <NumberInput
            label="Level"
            placeholder="Level (e.g. 1)"
            {...form.getInputProps("level")}
            min={1}
            required
            mb="sm"
          />
          <ColorInput
            label="Color"
            placeholder="Pick color"
            {...form.getInputProps("color")}
            required
            mb="md"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Cancel
            </Button>
            <Button type="submit">
              {editingPriority ? "Update" : "Create"}
            </Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
