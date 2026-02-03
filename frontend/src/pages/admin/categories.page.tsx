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
import {
  type Category,
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/use-categories";
import { usePermission } from "@/hooks/use-permission";

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: categoriesData, isLoading } = useCategories({ page, limit });
  const categories = categoriesData?.data || [];
  const totalRecords = categoriesData?.meta.total || 0;

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
    },
    validate: {
      name: (value) => (value.length < 1 ? "Name is required" : null),
    },
  });

  const { hasPermission } = usePermission();

  if (!hasPermission("categories:manage")) {
    return (
      <Container>
        <Text>Access Denied</Text>
      </Container>
    );
  }

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      form.setValues({
        name: category.name,
        description: category.description || "",
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
        await updateCategory.mutateAsync({ id: editingId, ...values });
        notifications.show({
          title: "Success",
          message: "Category updated",
          color: "green",
        });
      } else {
        await createCategory.mutateAsync(values);
        notifications.show({
          title: "Success",
          message: "Category created",
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
      title: "Delete Category",
      children: <Text>Are you sure? This cannot be undone.</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteCategory.mutateAsync(id);
          notifications.show({
            title: "Success",
            message: "Category deleted",
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

  const columns: Column<Category>[] = [
    {
      accessor: "name",
      title: "Name",
      render: (category) => category.name,
    },
    {
      accessor: "description",
      title: "Description",
      render: (category) => category.description || "-",
    },
    {
      accessor: "actions",
      title: "Actions",
      render: (category) => (
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            title="Edit Category"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(category);
            }}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            title="Delete Category"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(category.id);
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
        <Title order={2}>Categories</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => handleOpenModal()}
        >
          Add Category
        </Button>
      </Group>

      <DataTable
        data={categories}
        columns={columns}
        total={totalRecords}
        page={page}
        limit={10}
        onPageChange={setPage}
        isLoading={isLoading}
        queryKey={["categories"]}
      />

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Category" : "New Category"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Name"
            required
            {...form.getInputProps("name")}
            mb="md"
          />
          <TextInput
            label="Description"
            {...form.getInputProps("description")}
            mb="md"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createCategory.isPending || updateCategory.isPending}
            >
              {editingId ? "Update" : "Create"}
            </Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
