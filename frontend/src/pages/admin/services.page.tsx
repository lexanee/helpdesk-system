import {
  ActionIcon,
  Button,
  Container,
  Group,
  Modal,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

import { type Column, DataTable } from "@/components/data-table";
import { usePermission } from "@/hooks/use-permission";
import {
  type Service,
  useCreateService,
  useDeleteService,
  useServices,
  useUpdateService,
} from "@/hooks/use-services";

export default function ServicesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: servicesData, isLoading } = useServices({ page, limit });
  const services = servicesData?.data || [];
  const totalRecords = servicesData?.meta.total || 0;

  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

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

  if (!hasPermission("services:manage")) {
    return (
      <Container>
        <Text>Access Denied</Text>
      </Container>
    );
  }

  const handleSubmit = async (values: typeof form.values) => {
    if (editingService) {
      await updateService.mutateAsync({ id: editingService.id, data: values });
    } else {
      await createService.mutateAsync(values);
    }
    close();
    form.reset();
    setEditingService(null);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.setValues({
      name: service.name,
      description: service.description || "",
    });
    open();
  };

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: "Delete Service",
      children: "Are you sure you want to delete this service?",
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteService.mutate(id),
    });
  };

  const columns: Column<Service>[] = [
    { accessor: "name", title: "Name" },
    { accessor: "description", title: "Description" },
    {
      accessor: "actions",
      title: "Actions",
      render: (service) => (
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            title="Edit Service"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(service);
            }}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            title="Delete Service"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(service.id);
            }}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  if (isLoading) return <div>Loading...</div>;

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Services</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            setEditingService(null);
            form.reset();
            open();
          }}
        >
          Add Service
        </Button>
      </Group>

      <DataTable
        data={services}
        columns={columns}
        total={totalRecords}
        page={page}
        limit={10}
        onPageChange={setPage}
        isLoading={isLoading}
        queryKey={["services"]}
      />

      <Modal
        opened={opened}
        onClose={close}
        title={editingService ? "Edit Service" : "Add Service"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Name"
            placeholder="Service Name"
            {...form.getInputProps("name")}
            required
            mb="sm"
          />
          <Textarea
            label="Description"
            placeholder="Description"
            {...form.getInputProps("description")}
            mb="md"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Cancel
            </Button>
            <Button type="submit">
              {editingService ? "Update" : "Create"}
            </Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
