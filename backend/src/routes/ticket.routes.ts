import { Router } from "express";
import * as ticketController from "../controllers/ticket.controller.js";
import {
  authenticateToken,
  requirePermission,
} from "../middlewares/auth.middleware.js";
import { upload } from "../utils/storage.utils.js";

const router = Router();

router.use(authenticateToken as any);

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - message
 *               - categoryId
 *               - priorityId
 *             properties:
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               priorityId:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Ticket created
 *       400:
 *         description: Bad request
 */
router.post(
  "/",
  requirePermission("tickets:create") as any,
  upload.array("attachments") as any,
  ticketController.createTicket as any,
);

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Get all tickets
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tickets
 */
router.get(
  "/",
  requirePermission("tickets:view") as any,
  ticketController.getTickets as any,
);

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket details
 *       404:
 *         description: Ticket not found
 */
router.get(
  "/:id",
  requirePermission("tickets:view") as any,
  ticketController.getTicketById as any,
);

/**
 * @swagger
 * /tickets/{id}:
 *   put:
 *     summary: Update ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statusId:
 *                 type: string
 *               priorityId:
 *                 type: string
 *               assignedToId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket updated
 */
router.put(
  "/:id",
  requirePermission("tickets:update") as any,
  ticketController.updateTicket as any,
);

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Delete ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket deleted
 */
router.delete(
  "/:id",
  requirePermission("tickets:delete") as any,
  ticketController.deleteTicket as any,
);

/**
 * @swagger
 * /tickets/{id}/messages:
 *   post:
 *     summary: Create a new message for a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Message created
 *       400:
 *         description: Bad request
 */
router.post(
  "/:id/messages",
  requirePermission("tickets:update") as any,
  upload.array("attachments") as any,
  ticketController.createMessage as any,
);

/**
 * @swagger
 * /tickets/{id}/messages:
 *   get:
 *     summary: Get messages for a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get(
  "/:id/messages",
  requirePermission("tickets:view") as any,
  ticketController.getTicketMessages as any,
);

/**
 * @swagger
 * /tickets/{id}/messages/attachments/{filename}:
 *   get:
 *     summary: Get message attachment
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File content
 *       403:
 *         description: Access denied
 *       404:
 *         description: File or ticket not found
 */
router.get(
  "/:id/messages/attachments/:filename",
  requirePermission("tickets:view") as any,
  ticketController.getAttachment as any,
);

export default router;
