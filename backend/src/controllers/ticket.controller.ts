import { Request, Response } from "express";
import * as ticketService from "../services/ticket.service.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export const createTicket = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const files = req.files as Express.Multer.File[];
    const ticket = await ticketService.createTicket(
      userId,
      req.body,
      files,
      req.ip,
    );
    res.status(201).json(ticket);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getTickets = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const filters = {
      statusId: req.query.statusId as string,
      categoryId: req.query.categoryId as string,
      assignedTo: req.query.assignedTo as string,
      createdBy: req.query.createdBy as string,
    };

    // If user is a customer, force them to only see their own tickets
    if (user.role === "customer") {
      filters.createdBy = user.userId;
    }

    // If user is a support agent, force them to only see assigned tickets
    if (user.role === "support_agent") {
      filters.assignedTo = user.userId;
    }

    // Remove undefined filters
    Object.keys(filters).forEach(
      (key) =>
        (filters as any)[key] === undefined && delete (filters as any)[key],
    );

    const tickets = await ticketService.getTickets(req.query, filters);
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTicketById = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const ticket = await ticketService.getTicketById(req.params.id);

    // Check if user is allowed to view this ticket
    if (user.role === "customer" && ticket.createdBy !== user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (user.role === "support_agent" && ticket.assignedTo !== user.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(ticket);
  } catch (error: any) {
    if (error.message === "Ticket not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const updateTicket = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const ticket = await ticketService.updateTicket(
      req.params.id,
      userId,
      req.body,
      req.ip,
    );
    res.json(ticket);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTicket = async (req: AuthRequest, res: Response) => {
  try {
    const performerId = req.user.userId;
    await ticketService.deleteTicket(req.params.id, performerId, req.ip);
    res.json({ message: "Ticket deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const ticketId = req.params.id;
    const content = req.body.content;
    const files = req.files as Express.Multer.File[];

    if (!content && (!files || files.length === 0)) {
      return res.status(400).json({
        error: "Message content or attachment is required",
      });
    }

    const message = await ticketService.createMessage(
      userId,
      ticketId,
      content || "",
      files,
      req.ip,
    );
    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getTicketMessages = async (req: AuthRequest, res: Response) => {
  try {
    const messages = await ticketService.getTicketMessages(req.params.id);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const { id: ticketId, filename } = req.params;
    const user = req.user;

    // Check if ticket exists and user has permission
    const ticket = await ticketService.getTicketById(ticketId);

    // Check permissions
    const canView =
      user.role === "administrator" ||
      (user.role === "support_agent" && ticket.assignedTo === user.userId) ||
      (user.role === "customer" && ticket.createdBy === user.userId);

    if (!canView) {
      return res.status(403).json({ error: "Access denied" });
    }

    const filePath = (await import("../utils/storage.utils.js")).getFilePath(
      filename,
    );

    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({ error: "File not found" });
      }
    });
  } catch (error: any) {
    if (error.message === "Ticket not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};
