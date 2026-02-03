import {
  ActionIcon,
  Badge,
  Container,
  Group,
  Paper,
  Select,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconSearch, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

import { type Column, DataTable } from "@/components/data-table";
import { usePermission } from "@/hooks/use-permission";
import {
  useDeleteUser,
  type User,
  useUpdateUserRole,
  useUsers,
} from "@/hooks/use-users";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: userData, isLoading: loading } = useUsers({ page, limit });
  const users: User[] = userData?.data || [];
  const totalRecords = userData?.meta.total || 0;

  const updateUserRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

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

  const handleRoleChange = async (userId: string, newRole: string) => {
    modals.openConfirmModal({
      title: "Change User Role",
      children: <Text>Are you sure you want to change this user's role?</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: async () => {
        try {
          await updateUserRole.mutateAsync({ id: userId, role: newRole });
          notifications.show({
            title: "Success",
            message: "User role updated successfully",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Error",
            message: (error as Error).message || "Failed to update user role",
            color: "red",
          });
        }
      },
    });
  };

  // Client-side filtering (Note: only filters current page)
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || user.role?.name === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
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
        <Badge color={getRoleBadgeColor(user.role?.name || "customer")}>
          {(user.role?.name || "customer").replace("_", " ")}
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
        <Group gap="xs">
          <Select
            placeholder="Change role"
            value={user.role?.name}
            onChange={(value) => value && handleRoleChange(user.id, value)}
            data={[
              { value: "customer", label: "Customer" },
              { value: "support_agent", label: "Support Agent" },
              { value: "administrator", label: "Administrator" },
            ]}
            size="xs"
            w={150}
            onClick={(e) => e.stopPropagation()}
          />
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
      ),
    },
  ];

  const { hasPermission } = usePermission();

  if (!hasPermission("admin:manage_users")) {
    return (
      <Container>
        <Text>Access Denied</Text>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Title order={2} mb="xl">
        Users
      </Title>

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
            data={[
              { value: "", label: "All Roles" },
              { value: "customer", label: "Customer" },
              { value: "support_agent", label: "Support Agent" },
              { value: "administrator", label: "Administrator" },
            ]}
            clearable
          />
        </Group>
      </Paper>

      <DataTable
        data={filteredUsers}
        columns={columns}
        total={totalRecords}
        page={page}
        limit={10}
        onPageChange={setPage}
        isLoading={loading}
        queryKey={["users"]}
      />
    </Container>
  );
}
