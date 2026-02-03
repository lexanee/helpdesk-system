import {
  ActionIcon,
  Button,
  Container,
  Group,
  Modal,
  Stack,
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
  type Permission,
  useCreatePermission,
  useDeletePermission,
  usePermissions,
  useUpdatePermission,
} from "@/hooks/use-permissions";

export function PermissionsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null,
  );

  const { data, isLoading } = usePermissions({ page, limit });
  const permissions = data?.data || [];
  const total = data?.meta?.total || 0;
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();

  const { hasPermission } = usePermission();

  const form = useForm({
    initialValues: {
      slug: "",
      description: "",
    },
    validate: {
      slug: (value) => (value.length < 1 ? "Slug is required" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingPermission) {
        await updatePermission.mutateAsync({
          id: editingPermission.id,
          data: values,
        });
        notifications.show({
          title: "Success",
          message: "Permission updated successfully",
          color: "green",
        });
      } else {
        await createPermission.mutateAsync(values);
        notifications.show({
          title: "Success",
          message: "Permission created successfully",
          color: "green",
        });
      }
      close();
      form.reset();
      setEditingPermission(null);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.error || "Failed to save permission",
        color: "red",
      });
    }
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    form.setValues({
      slug: permission.slug,
      description: permission.description || "",
    });
    open();
  };

  const handleDelete = (id: string, slug: string) => {
    modals.openConfirmModal({
      title: "Delete Permission",
      children: (
        <Text size="sm">
          Are you sure you want to delete permission <b>{slug}</b>?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deletePermission.mutateAsync(id);
          notifications.show({
            title: "Success",
            message: "Permission deleted successfully",
            color: "green",
          });
        } catch (error: any) {
          notifications.show({
            title: "Error",
            message:
              error.response?.data?.error || "Failed to delete permission",
            color: "red",
          });
        }
      },
    });
  };

  const handleOpenCreate = () => {
    setEditingPermission(null);
    form.reset();
    open();
  };

  if (!hasPermission("admin:manage_roles")) {
    return (
      <Container>
        <Text>Access Denied</Text>
      </Container>
    );
  }

  const columns: Column<Permission>[] = [
    { accessor: "slug", title: "Slug" },
    { accessor: "description", title: "Description" },
    {
      accessor: "actions",
      title: "Actions",
      render: (permission) => (
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleEdit(permission)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => handleDelete(permission.id, permission.slug)}
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
        <Title order={2}>Permissions</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
          Create Permission
        </Button>
      </Group>

      <DataTable
        columns={columns}
        data={permissions}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
      />

      <Modal
        opened={opened}
        onClose={close}
        title={editingPermission ? "Edit Permission" : "Create Permission"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Slug"
              placeholder="e.g., ticket:create"
              required
              {...form.getInputProps("slug")}
            />
            <TextInput
              label="Description"
              placeholder="Permission description"
              {...form.getInputProps("description")}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={
                  createPermission.isPending || updatePermission.isPending
                }
              >
                {editingPermission ? "Update" : "Create"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
