import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Modal,
  Paper,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { useMemo, useState } from "react";

import { type Column, DataTable } from "@/components/data-table";
import { AccessGuard } from "@/components/guards/access-guard";
import { usePermission } from "@/hooks/use-permission";
import { useRoles } from "@/hooks/use-roles";
import {
  useCreateUser,
  useDeleteUser,
  type User,
  useUpdateUser,
  useUsers,
} from "@/hooks/use-users";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  // Modal state
  const [opened, { open, close }] = useDisclosure(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: userData, isLoading: loadingUsers } = useUsers({ page, limit });
  const users: User[] = userData?.data || [];
  const totalRecords = userData?.meta.total || 0;

  const { data: roles = [], isLoading: loadingRoles } = useRoles();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const { hasPermission } = usePermission();

  const form = useForm({
    initialValues: {
      email: "",
      fullName: "",
      password: "",
      roleId: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      fullName: (value) => (value.length < 1 ? "Full name is required" : null),
      password: (value) => {
        if (!editingUser && value.length < 6)
          return "Password must be at least 6 chars";
        if (editingUser && value.length > 0 && value.length < 6)
          return "Password must be at least 6 chars";
        return null;
      },
      roleId: (value) => (value.length < 1 ? "Role is required" : null),
    },
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      form.setValues({
        email: user.email,
        fullName: user.fullName || "",
        password: "", // Don't show password
        roleId:
          roles.find((r) => r.name === user.role?.name)?.id ||
          (user.role as any).id ||
          "",
      });
    } else {
      setEditingUser(null);
      form.reset();
    }
    open();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingUser) {
        await updateUser.mutateAsync({
          id: editingUser.id,
          data: {
            email: values.email,
            fullName: values.fullName,
            roleId: values.roleId,
            password: values.password || undefined,
          },
        });
        notifications.show({
          title: "Success",
          message: "User updated successfully",
          color: "green",
        });
      } else {
        await createUser.mutateAsync({
          email: values.email,
          fullName: values.fullName,
          roleId: values.roleId,
          password: values.password,
        });
        notifications.show({
          title: "Success",
          message: "User created successfully",
          color: "green",
        });
      }
      close();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: (error as Error).message || "Operation failed",
        color: "red",
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    modals.openConfirmModal({
      title: "Delete User",
      children: (
        <Text>
          Are you sure you want to delete this user? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteUser.mutateAsync(userId);
          notifications.show({
            title: "Success",
            message: "User deleted successfully",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Error",
            message: (error as Error).message || "Failed to delete user",
            color: "red",
          });
        }
      },
    });
  };

  // Client-side filtering
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || user.role?.name === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case "administrator":
        return "red";
      case "support_agent":
        return "blue";
      case "customer":
        return "gray";
      default:
        return "gray";
    }
  };

  // Prepare role options for Select components
  const roleOptions = useMemo(() => {
    return roles.map((r) => ({
      value: r.id,
      label: r.name,
    }));
  }, [roles]);

  const roleFilterOptions = useMemo(() => {
    return roles.map((r) => ({
      value: r.name,
      label: r.name,
    }));
  }, [roles]);

  const columns: Column<User>[] = [
    {
      accessor: "fullName",
      title: "Name",
      render: (user) => user.fullName || "N/A",
    },
    { accessor: "email", title: "Email" },
    {
      accessor: "role",
      title: "Role",
      render: (user) => (
        <Badge
          color={getRoleBadgeColor(user.role?.name || "customer")}
          variant="light"
        >
          {user.role?.name || "N/A"}
        </Badge>
      ),
    },
    {
      accessor: "createdAt",
      title: "Joined",
      render: (user) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      accessor: "actions",
      title: "Actions",
      render: (user) => (
        <AccessGuard permissions="users:manage">
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => handleOpenModal(user)}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              variant="subtle"
              title="Delete User"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteUser(user.id);
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </AccessGuard>
      ),
    },
  ];

  if (!hasPermission(["users:manage", "users:view"])) {
    return (
      <Container>
        <Text>Access Denied</Text>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Users</Title>
        <AccessGuard permissions="users:manage">
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => handleOpenModal()}
          >
            Create User
          </Button>
        </AccessGuard>
      </Group>

      <Paper withBorder p="md" mb="md">
        <Group gap="md">
          <TextInput
            placeholder="Search users..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by role"
            value={roleFilter}
            onChange={setRoleFilter}
            data={[{ value: "", label: "All Roles" }, ...roleFilterOptions]}
            clearable
            searchable
          />
        </Group>
      </Paper>

      <DataTable
        data={filteredUsers}
        columns={columns}
        total={totalRecords}
        page={page}
        limit={limit}
        onPageChange={setPage}
        isLoading={loadingUsers || loadingRoles}
        queryKey={["users"]}
      />

      <Modal
        opened={opened}
        onClose={close}
        title={editingUser ? "Edit User" : "Create User"}
      >
        <LoadingOverlay
          visible={createUser.isPending || updateUser.isPending}
        />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="user@example.com"
              required
              {...form.getInputProps("email")}
            />
            <TextInput
              label="Full Name"
              placeholder="John Doe"
              required
              {...form.getInputProps("fullName")}
            />
            <PasswordInput
              label="Password"
              placeholder={
                editingUser
                  ? "Leave blank to keep current password"
                  : "Enter password"
              }
              required={!editingUser}
              {...form.getInputProps("password")}
            />
            <Select
              label="Role"
              placeholder="Select role"
              data={roleOptions}
              required
              searchable
              {...form.getInputProps("roleId")}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">{editingUser ? "Update" : "Create"}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
