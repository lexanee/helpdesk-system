import { Router } from "express";
import {
  createPriority,
  deletePriority,
  getPriorities,
  getPriorityById,
  updatePriority,
} from "../controllers/priority.controller.js";
import {
  authenticateToken,
  requirePermission,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken as any);

/**
 * @swagger
 * /priorities:
 *   get:
 *     summary: Get all priorities
 *     tags: [Priorities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of priorities
 */
router.get("/", getPriorities as any);

/**
 * @swagger
 * /priorities/{id}:
 *   get:
 *     summary: Get priority by ID
 *     tags: [Priorities]
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
 *         description: Priority details
 *       404:
 *         description: Priority not found
 */
router.get("/:id", getPriorityById as any);

/**
 * @swagger
 * /priorities:
 *   post:
 *     summary: Create a new priority
 *     tags: [Priorities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - level
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *               level:
 *                 type: integer
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Priority created
 *       400:
 *         description: Bad request
 */
router.post(
  "/",
  requirePermission("priorities:manage") as any,
  createPriority as any,
);

/**
 * @swagger
 * /priorities/{id}:
 *   put:
 *     summary: Update priority
 *     tags: [Priorities]
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
 *               name:
 *                 type: string
 *               level:
 *                 type: integer
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Priority updated
 */
router.put(
  "/:id",
  requirePermission("priorities:manage") as any,
  updatePriority as any,
);

/**
 * @swagger
 * /priorities/{id}:
 *   delete:
 *     summary: Delete priority
 *     tags: [Priorities]
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
 *         description: Priority deleted
 */
router.delete(
  "/:id",
  requirePermission("priorities:manage") as any,
  deletePriority as any,
);

export default router;
