import {
  Badge,
  Button,
  Container,
  Divider,
  FileInput,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconPaperclip, IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AccessGuard } from "@/components/guards/access-guard";
import { useSocket } from "@/context/socket-context";
import { useAuth } from "@/hooks/use-auth";
import { type Category, useCategories } from "@/hooks/use-categories";
import { usePermission } from "@/hooks/use-permission";
import { type Status, useStatuses } from "@/hooks/use-statuses";
import {
  type Message,
  useCreateMessage,
  useDeleteTicket,
  useMessages,
  useTicket,
  useUpdateTicket,
} from "@/hooks/use-tickets";
import { type User, useUsers } from "@/hooks/use-users";
import { Route } from "@/routes/_layout/tickets/$id";

export default function TicketDetailPage() {
  const { id } = Route.useParams();
  const { data: user } = useAuth();
  const navigate = useNavigate();
  const { hasRole } = usePermission();

  const { data: ticket, isLoading } = useTicket(id!);
  const { data: messages = [] } = useMessages(id!);

  // Fetch all statuses and categories (limit 1000)
  const { data: statusesData } = useStatuses({ limit: 1000 });
  const statuses: Status[] = statusesData?.data || [];

  const { data: categoriesData } = useCategories({ limit: 1000 });
  const categories: Category[] = categoriesData?.data || [];

  const canManageTicket =
    hasRole(["administrator", "support_agent"]) ||
    ticket?.assignedTo === user?.id;

  // Fetch all users for dropdowns (limit 1000) - Only if can manage ticket
  const { data: usersData } = useUsers(
    { limit: 1000 },
    { enabled: !!canManageTicket },
  );
  const users: User[] = usersData?.data || [];

  const supportAgents = users.filter((p) =>
    ["support_agent", "administrator"].includes(p.role?.name),
  );

  const updateTicket = useUpdateTicket();
  const deleteTicket = useDeleteTicket();
  const createMessage = useCreateMessage();

  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (socket && id) {
      socket.emit("join-ticket", id);

      socket.on("ticket:update", (data) => {
        console.log("Received ticket update:", data);
        if (data.type === "ticket_updated") {
          queryClient.invalidateQueries({ queryKey: ["tickets", id] });
          notifications.show({
            title: "Update",
            message: "Ticket has been updated",
            color: "blue",
          });
        } else if (data.type === "message_added") {
          queryClient.invalidateQueries({ queryKey: ["messages", id] });
          notifications.show({
            title: "New Message",
            message: "A new message has been added",
            color: "blue",
          });
        }
      });

      return () => {
        socket.emit("leave-ticket", id);
        socket.off("ticket:update");
      };
    }
  }, [socket, id, queryClient]);

  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleAddMessage = async () => {
    if ((!newMessage.trim() && !file) || !ticket) return;

    try {
      const formData = new FormData();
      formData.append("content", newMessage);
      if (file) {
        formData.append("attachments", file);
      }

      await createMessage.mutateAsync({
        ticketId: ticket.id,
        formData,
      });

      setNewMessage("");
      setFile(null);
      notifications.show({
        title: "Success",
        message: "Message added successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: (error as Error).message || "Failed to add message",
        color: "red",
      });
    }
  };

  const handleStatusChange = async (newStatusId: string) => {
    if (!ticket) return;

    try {
      await updateTicket.mutateAsync({
        id: ticket.id,
        statusId: newStatusId,
      });

      notifications.show({
        title: "Success",
        message: "Ticket status updated",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: (error as Error).message || "Failed to update status",
        color: "red",
      });
    }
  };

  const handleAssignTicket = async (userId: string) => {
    if (!ticket) return;

    try {
      await updateTicket.mutateAsync({
        id: ticket.id,
        assignedTo: userId,
      });

      notifications.show({
        title: "Success",
        message: "Ticket assigned successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: (error as Error).message || "Failed to assign ticket",
        color: "red",
      });
    }
  };

  const handleDeleteTicket = () => {
    modals.openConfirmModal({
      title: "Delete Ticket",
      children: (
        <Text>
          Are you sure you want to delete this ticket? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteTicket.mutateAsync(id!);
          notifications.show({
            title: "Success",
            message: "Ticket deleted successfully",
            color: "green",
          });
          navigate({ to: "/tickets" });
        } catch (error) {
          notifications.show({
            title: "Error",
            message: (error as Error).message || "Failed to delete ticket",
            color: "red",
          });
        }
      },
    });
  };

  const getUserName = (
    userId: string | null,
    userObj?: { fullName: string | null; email: string },
  ) => {
    if (userObj) return userObj.fullName || userObj.email || "Unknown";
    if (!userId) return "Unassigned";
    // Fallback to finding in list if available (for admins/agents)
    const foundUser = users.find((p) => p.id === userId);
    return foundUser?.fullName || foundUser?.email || "Unknown";
  };

  const getStatusName = (statusId: string) => {
    return statuses.find((s) => s.id === statusId)?.name || "Unknown";
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  if (isLoading || !ticket) {
    return (
      <Container>
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Group mb="xl">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate({ to: "/tickets" })}
        >
          Back to Tickets
        </Button>
        <AccessGuard permissions="ticket:delete">
          <Button
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={handleDeleteTicket}
            ml="auto"
          >
            Delete Ticket
          </Button>
        </AccessGuard>
      </Group>

      <Paper withBorder p="md" mb="md">
        <Stack>
          <Group justify="space-between">
            <Title order={2}>{ticket.title}</Title>
            <Group>
              <Badge color={ticket.priority?.color || "gray"}>
                {ticket.priority?.name || "Unknown"}
              </Badge>
              <Badge
                color={
                  getStatusName(ticket.statusId) === "Open"
                    ? "blue"
                    : getStatusName(ticket.statusId) === "In Progress"
                      ? "yellow"
                      : getStatusName(ticket.statusId) === "Resolved"
                        ? "green"
                        : "gray"
                }
              >
                {getStatusName(ticket.statusId)}
              </Badge>
            </Group>
          </Group>

          <Text size="sm" c="dimmed">
            Created by {getUserName(ticket.createdBy, ticket.creator)} on{" "}
            {new Date(ticket.createdAt).toLocaleString()}
          </Text>

          <Divider />

          <Group>
            <div>
              <Text size="sm" c="dimmed">
                Category
              </Text>
              <Text fw={500}>{getCategoryName(ticket.categoryId)}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                Assigned To
              </Text>
              <Text fw={500}>
                {getUserName(ticket.assignedTo, ticket.assignee)}
              </Text>
            </div>
            {ticket.service && (
              <div>
                <Text size="sm" c="dimmed">
                  Service
                </Text>
                <Text fw={500}>{ticket.service.name}</Text>
              </div>
            )}
          </Group>

          {canManageTicket && (
            <>
              <Divider />
              <Group>
                <Select
                  label="Update Status"
                  placeholder="Select status"
                  value={ticket.statusId}
                  onChange={(value) => value && handleStatusChange(value)}
                  data={statuses.map((s) => ({ value: s.id, label: s.name }))}
                  style={{ flex: 1 }}
                />

                {/* Only Admins can assign tickets */}
                <AccessGuard roles={["administrator"]}>
                  <Select
                    label="Assign To"
                    placeholder="Select agent"
                    value={ticket.assignedTo || ""}
                    onChange={(value) => value && handleAssignTicket(value)}
                    data={supportAgents.map((p) => ({
                      value: p.id,
                      label: p.fullName || p.email,
                    }))}
                    style={{ flex: 1 }}
                  />
                </AccessGuard>
              </Group>
            </>
          )}
        </Stack>
      </Paper>

      <Paper withBorder p="md">
        <Stack gap="md" mb="md">
          <Title order={4}>Messages ({messages.length})</Title>
          {messages.length === 0 ? (
            <Text c="dimmed" ta="center">
              No messages yet
            </Text>
          ) : (
            messages.map((message: Message) => (
              <Paper key={message.id} p="sm" withBorder>
                <Group mb="xs">
                  <div>
                    <Text size="sm" fw={500}>
                      {getUserName(message.userId, message.user)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {new Date(message.createdAt).toLocaleString()}
                    </Text>
                  </div>
                </Group>
                <Text size="sm">{message.content}</Text>
                {message.attachments && message.attachments.length > 0 && (
                  <Stack gap="xs" mt="xs">
                    {message.attachments.map((file) => (
                      <Group key={file.id} gap="xs">
                        <IconPaperclip size={14} />
                        <Text
                          size="xs"
                          component="a"
                          href={`http://localhost:5000${file.fileUrl}`}
                          target="_blank"
                          c="blue"
                        >
                          {file.fileName}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                )}
              </Paper>
            ))
          )}
        </Stack>

        <Divider mb="md" />

        <Textarea
          placeholder="Add a message..."
          minRows={3}
          value={newMessage}
          onChange={(e) => setNewMessage(e.currentTarget.value)}
          mb="sm"
        />
        <FileInput
          value={file}
          onChange={setFile}
          leftSection={<IconPaperclip size={16} />}
          placeholder="Attach file"
          mb="md"
          clearable
        />

        <Button
          onClick={handleAddMessage}
          loading={createMessage.isPending}
          disabled={!newMessage.trim() && !file}
        >
          Add Message
        </Button>
      </Paper>
    </Container>
  );
}
