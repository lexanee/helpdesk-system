import {
  Button,
  CloseButton,
  Container,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { type FileWithPath } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { IconFile } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import FileUpload from "@/components/file-upload";
import { type Category, useCategories } from "@/hooks/use-categories";
import { usePriorities } from "@/hooks/use-priorities";
import { type Service, useServices } from "@/hooks/use-services";
import { useCreateTicket } from "@/hooks/use-tickets";

export default function CreateTicketPage() {
  const navigate = useNavigate();

  const { data: categoriesData } = useCategories({ limit: 1000 });
  const categories: Category[] = categoriesData?.data || [];

  const { data: servicesData } = useServices({ limit: 1000 });
  const services: Service[] = servicesData?.data || [];

  const { data: priorities = [] } = usePriorities();

  const createTicket = useCreateTicket();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");
  const [priorityId, setPriorityId] = useState<string>("");
  const [files, setFiles] = useState<FileWithPath[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("categoryId", categoryId);
      if (serviceId) formData.append("serviceId", serviceId);
      if (priorityId) formData.append("priorityId", priorityId);

      files.forEach((file) => {
        formData.append("attachments", file);
      });

      await createTicket.mutateAsync(formData);

      notifications.show({
        title: "Success",
        message: "Ticket created successfully",
        color: "green",
      });

      navigate({ to: "/tickets" });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: (error as Error).message || "Failed to create ticket",
        color: "red",
      });
    }
  };

  return (
    <Container size="md">
      <Title order={2} mb="xl">
        Create New Ticket
      </Title>

      <Paper withBorder p="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Subject"
              placeholder="Brief subject of the issue"
              required
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
            />

            <Textarea
              label="Message"
              placeholder="Detailed message describing the issue"
              required
              minRows={4}
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />

            <Select
              label="Category"
              placeholder="Select a category"
              required
              value={categoryId}
              onChange={(value) => setCategoryId(value || "")}
              data={categories.map((c) => ({ value: c.id, label: c.name }))}
            />

            <Select
              label="Service (Optional)"
              placeholder="Select a service"
              value={serviceId}
              onChange={(value) => setServiceId(value || "")}
              data={services.map((s: Service) => ({
                value: s.id,
                label: s.name,
              }))}
              clearable
            />

            <Select
              label="Priority"
              placeholder="Select priority"
              required
              value={priorityId}
              onChange={(value) => setPriorityId(value || "")}
              data={priorities.map((p) => ({ value: p.id, label: p.name }))}
            />

            <div>
              <Text size="sm" fw={500} mb="xs">
                Attachments (Optional)
              </Text>
              <FileUpload
                onFilesSelected={(newFiles) =>
                  setFiles([...files, ...newFiles])
                }
                maxFiles={5}
              />
              {files.length > 0 && (
                <Stack gap="xs" mt="md">
                  {files.map((file, index) => (
                    <Paper key={index} p="xs" withBorder>
                      <Group justify="space-between">
                        <Group>
                          <IconFile size={20} />
                          <div>
                            <Text size="sm">{file.name}</Text>
                            <Text size="xs" c="dimmed">
                              {(file.size / 1024).toFixed(1)} KB
                            </Text>
                          </div>
                        </Group>
                        <CloseButton
                          onClick={() =>
                            setFiles(files.filter((_, i) => i !== index))
                          }
                        />
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}
            </div>

            <Button type="submit" loading={createTicket.isPending}>
              Create Ticket
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
