import prisma from "../utils/prisma.js";
import { z } from "zod";
import { emitTicketListUpdate, emitTicketUpdate } from "./socket.service.js";
import { createLog } from "./log.service.js";
import { createNotification } from "./notification.service.js";
import {
  createPaginatedResponse,
  getPaginationParams,
} from "../utils/pagination.utils.js";
import {
  CreateTicketDTO,
  TicketQueryParams,
  UpdateTicketDTO,
} from "../types/dtos.js";

const createTicketSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
  priorityId: z.string().uuid().optional(),
});

const updateTicketSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  categoryId: z.string().uuid().optional(),
  statusId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  priorityId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional().nullable(),
});

export const createTicket = async (
  userId: string,
  data: CreateTicketDTO,
  files: Express.Multer.File[] = [],
  ipAddress?: string,
) => {
  const { title, description, categoryId, serviceId, priorityId } =
    createTicketSchema.parse(data);

  // Get default status (Open)
  const defaultStatus = await prisma.status.findFirst({
    where: { name: "Open", deletedAt: null },
  });

  if (!defaultStatus) {
    throw new Error('Default status "Open" not found');
  }

  // Get default priority (Medium) if not provided
  let finalPriorityId = priorityId;
  if (!finalPriorityId) {
    const defaultPriority = await prisma.priority.findFirst({
      where: { isDefault: true },
    });
    finalPriorityId = defaultPriority?.id;
  }

  const ticket = await prisma.$transaction(async (tx) => {
    const t = await tx.ticket.create({
      data: {
        title,
        description,
        categoryId,
        statusId: defaultStatus.id,
        serviceId,
        priorityId: finalPriorityId,
        createdBy: userId,
      },
      include: {
        category: true,
        status: true,
        service: true,
        priority: true,
        creator: {
          select: { id: true, email: true, fullName: true },
        },
      },
    });

    // Create initial message from description
    const initialMessage = await tx.ticketMessage.create({
      data: {
        ticketId: t.id,
        userId,
        content: description,
      },
    });

    if (files.length > 0) {
      await tx.ticketMessageAttachment.createMany({
        data: files.map((file) => ({
          messageId: initialMessage.id,
          fileName: file.originalname,
          fileUrl: `/api/tickets/${t.id}/messages/attachments/${file.filename}`,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedBy: userId,
        })),
      });
    }

    return { ...t, initialMessageId: initialMessage.id };
  });

  // Activity Log
  await createLog(
    userId,
    "Created ticket",
    `Ticket #${ticket.id} created`,
    ticket.id,
    ipAddress,
  );

  // Notify Admins and Managers
  const admins = await prisma.user.findMany({
    where: {
      role: { name: { in: ["administrator", "manager"] } },
      id: { not: userId }, // Don't notify creator if they are admin
      deletedAt: null,
    },
    select: { id: true },
  });

  for (const admin of admins) {
    await createNotification(
      admin.id,
      "New Ticket Created",
      `Ticket #${ticket.title} created by ${
        ticket.creator.fullName || ticket.creator.email
      }`,
      "ticket_created",
      `/tickets/${ticket.id}`,
    );
  }

  emitTicketListUpdate({ type: "ticket_created", ticket });

  return ticket;
};

export const getTickets = async (
  query: TicketQueryParams,
  filters: {
    statusId?: string;
    categoryId?: string;
    assignedTo?: string;
    createdBy?: string;
  } = {},
) => {
  const { skip, take, page, limit } = getPaginationParams(query);

  const where = {
    ...filters,
    deletedAt: null,
  };

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        category: true,
        status: true,
        service: true,
        priority: true,
        assignee: {
          select: { id: true, email: true, fullName: true },
        },
        creator: {
          select: { id: true, email: true, fullName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.ticket.count({ where }),
  ]);

  return createPaginatedResponse(tickets, total, page, limit);
};

export const getTicketById = async (id: string) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      category: true,
      status: true,
      service: true,
      priority: true,
      assignee: {
        select: { id: true, email: true, fullName: true },
      },
      creator: {
        select: { id: true, email: true, fullName: true },
      },
      messages: {
        include: {
          user: {
            select: { id: true, email: true, fullName: true },
          },
          attachments: true,
        },
        orderBy: { createdAt: "asc" },
      },
      activityLogs: {
        include: {
          user: {
            select: { id: true, email: true, fullName: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!ticket || ticket.deletedAt) {
    throw new Error("Ticket not found");
  }

  return ticket;
};

export const updateTicket = async (
  id: string,
  userId: string,
  data: z.infer<typeof updateTicketSchema>,
  ipAddress?: string,
) => {
  const validatedData = updateTicketSchema.parse(data);

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { priority: true },
  });
  if (!ticket || ticket.deletedAt) {
    throw new Error("Ticket not found");
  }

  const updatedTicket = await prisma.ticket.update({
    where: { id },
    data: validatedData,
    include: {
      category: true,
      status: true,
      service: true,
      priority: true,
      assignee: {
        select: { id: true, email: true, fullName: true },
      },
    },
  });

  // Activity Log
  await createLog(
    userId,
    "Updated ticket",
    `Ticket #${id} updated`,
    id,
    ipAddress,
  );

  // Notifications
  // 1. Assignment
  if (
    validatedData.assignedTo &&
    validatedData.assignedTo !== ticket.assignedTo
  ) {
    await createNotification(
      validatedData.assignedTo,
      "Ticket Assigned",
      `You have been assigned to ticket #${ticket.title}`,
      "assignment",
      `/tickets/${id}`,
    );
  }

  // 2. Status Change
  if (validatedData.statusId && validatedData.statusId !== ticket.statusId) {
    // Notify Creator
    if (ticket.createdBy !== userId) {
      await createNotification(
        ticket.createdBy,
        "Ticket Status Updated",
        `Ticket #${ticket.title} status changed`,
        "status_change",
        `/tickets/${id}`,
      );
    }
  }

  // 3. Priority Change
  if (
    validatedData.priorityId &&
    validatedData.priorityId !== ticket.priorityId
  ) {
    const recipients = new Set<string>();
    if (ticket.createdBy !== userId) recipients.add(ticket.createdBy);
    if (ticket.assignedTo && ticket.assignedTo !== userId) {
      recipients.add(ticket.assignedTo);
    }

    for (const recipientId of recipients) {
      await createNotification(
        recipientId,
        "Ticket Priority Updated",
        `Ticket #${ticket.title} priority changed to ${updatedTicket.priority?.name}`,
        "priority_change",
        `/tickets/${id}`,
      );
    }
  }

  // 4. Category Change
  if (
    validatedData.categoryId &&
    validatedData.categoryId !== ticket.categoryId
  ) {
    const recipients = new Set<string>();
    if (ticket.createdBy !== userId) recipients.add(ticket.createdBy);
    if (ticket.assignedTo && ticket.assignedTo !== userId) {
      recipients.add(ticket.assignedTo);
    }

    for (const recipientId of recipients) {
      await createNotification(
        recipientId,
        "Ticket Category Updated",
        `Ticket #${ticket.title} category changed`,
        "category_change",
        `/tickets/${id}`,
      );
    }
  }

  emitTicketUpdate(id, { type: "ticket_updated", ticket: updatedTicket });
  emitTicketListUpdate({ type: "ticket_updated", ticket: updatedTicket });

  return updatedTicket;
};

export const deleteTicket = async (
  id: string,
  performerId: string,
  ipAddress?: string,
) => {
  const ticket = await prisma.ticket.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createLog(
    performerId,
    "Deleted ticket",
    `Soft deleted ticket ${ticket.title}`,
    id,
    ipAddress,
  );

  emitTicketListUpdate({ type: "ticket_deleted", ticketId: id });

  return ticket;
};

export const createMessage = async (
  userId: string,
  ticketId: string,
  content: string,
  files: Express.Multer.File[] = [],
  ipAddress?: string,
) => {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket || ticket.deletedAt) {
    throw new Error("Ticket not found");
  }

  // Create message and attachments in a transaction
  const message = await prisma.$transaction(async (tx) => {
    const msg = await tx.ticketMessage.create({
      data: {
        ticketId,
        userId,
        content,
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true },
        },
      },
    });

    if (files.length > 0) {
      await tx.ticketMessageAttachment.createMany({
        data: files.map((file) => ({
          messageId: msg.id,
          fileName: file.originalname,
          fileUrl: `/api/tickets/${ticketId}/messages/attachments/${file.filename}`,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedBy: userId,
        })),
      });
    }

    return msg;
  });

  // Refetch message with attachments
  const messageWithAttachments = await prisma.ticketMessage.findUnique({
    where: { id: message.id },
    include: {
      user: {
        select: { id: true, email: true, fullName: true },
      },
      attachments: true,
    },
  });

  // Activity Log
  await createLog(
    userId,
    "Added message",
    `Added message to ticket #${ticket.id}`,
    ticketId,
    ipAddress,
  );

  emitTicketUpdate(ticketId, {
    type: "message_added",
    message: messageWithAttachments,
  });

  // Notifications
  const recipients = new Set<string>();

  if (ticket.assignedTo && ticket.assignedTo !== userId) {
    recipients.add(ticket.assignedTo);
  }

  if (ticket.createdBy !== userId) {
    recipients.add(ticket.createdBy);
  }

  for (const recipientId of recipients) {
    await createNotification(
      recipientId,
      "New Message",
      `New message on ticket #${ticket.title}`,
      "message",
      `/tickets/${ticketId}`,
    );
  }

  return messageWithAttachments;
};

export const getTicketMessages = async (ticketId: string) => {
  return prisma.ticketMessage.findMany({
    where: { ticketId },
    include: {
      user: {
        select: { id: true, email: true, fullName: true },
      },
      attachments: true,
    },
    orderBy: { createdAt: "asc" },
  });
};
