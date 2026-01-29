import {
  ActionIcon,
  Button,
  Checkbox,
  Container,
  Group,
  Loader,
  Modal,
  Paper,
  SimpleGrid,
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
import { useMemo, useState } from "react";

import { type Column, DataTable } from "@/components/data-table";
import { usePermission } from "@/hooks/use-permission";
import {
  type Role,
  useAllPermissions,
  useCreateRole,
  useDeleteRole,
  useRoles,
  useUpdateRole,
} from "@/hooks/use-roles";

export function RoleListPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const { data: roles = [], isLoading: isLoadingRoles } = useRoles();
  const { data: allPermissions = [], isLoading: isLoadingPerms } =
    useAllPermissions();

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const { hasPermission } = usePermission();

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      permissions: [] as string[], // Slugs
    },
    validate: {
      name: (value) => (value.length < 1 ? "Name is required" : null),
    },
  });

  // Group permissions for the modal
  const groupedPermissions = useMemo(() => {
    return allPermissions.reduce((acc: any, perm: any) => {
      const parts = perm.slug.split(":");
      const entity = parts[0];
      if (!acc[entity]) acc[entity] = [];
      acc[entity].push(perm);
      return acc;
    }, {});
  }, [allPermissions]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Convert slugs back to IDs
      const permissionIds = values.permissions
        .map((slug) => allPermissions.find((p) => p.slug === slug)?.id)
        .filter(Boolean) as string[];

      const payload = {
        name: values.name,
        description: values.description,
        permissionIds,
      };

      if (editingRole) {
        await updateRole.mutateAsync({
          id: editingRole.id,
          data: payload,
        });
        notifications.show({
          title: "Success",
          message: "Role updated successfully",
          color: "green",
        });
      } else {
        await createRole.mutateAsync(payload);
        notifications.show({
          title: "Success",
          message: "Role created successfully",
          color: "green",
        });
      }
      close();
      form.reset();
      setEditingRole(null);
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to save role",
        color: "red",
      });
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    // Flatten role permissions to slugs
    const currentSlugs = role.permissions.map((p) => p.permission.slug);

    form.setValues({
      name: role.name,
      description: role.description || "",
      permissions: currentSlugs,
    });
    open();
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: "Delete Role",
      children: "Are you sure you want to delete this role?",
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteRole.mutateAsync(id);
          notifications.show({
            title: "Success",
            message: "Role deleted successfully",
            color: "green",
          });
        } catch {
          notifications.show({
            title: "Error",
            message: "Failed to delete role",
            color: "red",
          });
        }
      },
    });
  };

  const handleOpenCreate = () => {
    setEditingRole(null);
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

  const columns: Column<Role>[] = [
    { accessor: "name", title: "Name" },
    { accessor: "description", title: "Description" },
    {
      accessor: "actions",
      title: "Actions",
      render: (role) => (
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleEdit(role)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          {!role.isSystem && (
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => handleDelete(role.id)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Group>
      ),
    },
  ];

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Roles</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
          Create Role
        </Button>
      </Group>

      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoadingRoles}
        total={roles.length}
        page={page}
        limit={limit}
        onPageChange={setPage}
      />

      <Modal
        opened={opened}
        onClose={close}
        title={editingRole ? "Edit Role" : "Create Role"}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Role Name"
              placeholder="e.g., Supervisor"
              required
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Description"
              placeholder="Role description"
              {...form.getInputProps("description")}
            />

            <Text fw={500} mt="md">
              Permissions
            </Text>
            {isLoadingPerms ? (
              <Loader size="sm" />
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                {Object.entries(groupedPermissions).map(
                  ([entity, perms]: [string, any]) => (
                    <Paper key={entity} p="sm" withBorder bg="gray.0">
                      <Text tt="capitalize" fw={600} mb="xs">
                        {entity}
                      </Text>
                      <Stack gap="xs">
                        {perms.map((perm: any) => (
                          <Checkbox
                            key={perm.id}
                            label={perm.description || perm.slug}
                            value={perm.slug}
                            checked={form.values.permissions.includes(
                              perm.slug,
                            )}
                            onChange={(event) => {
                              const checked = event.currentTarget.checked;
                              const current = form.values.permissions;
                              form.setFieldValue(
                                "permissions",
                                checked
                                  ? [...current, perm.slug]
                                  : current.filter((p) => p !== perm.slug),
                              );
                            }}
                          />
                        ))}
                      </Stack>
                    </Paper>
                  ),
                )}
              </SimpleGrid>
            )}

            <Group justify="flex-end" mt="xl">
              <Button variant="default" onClick={close}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createRole.isPending || updateRole.isPending}
              >
                {editingRole ? "Update" : "Create"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
