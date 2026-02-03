import { Router } from "express";
import * as statusController from "../controllers/status.controller.js";
import {
  authenticateToken,
  requirePermission,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken as any);

/**
 * @swagger
 * /statuses:
 *   post:
 *     summary: Create a new status
 *     tags: [Statuses]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Status created
 *       400:
 *         description: Bad request
 */
router.post(
  "/",
  requirePermission("statuses:manage") as any,
  statusController.createStatus as any,
);

/**
 * @swagger
 * /statuses:
 *   get:
 *     summary: Get all statuses
 *     tags: [Statuses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of statuses
 */
router.get("/", statusController.getAllStatuses as any);

/**
 * @swagger
 * /statuses/{id}:
 *   put:
 *     summary: Update status
 *     tags: [Statuses]
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put(
  "/:id",
  requirePermission("statuses:manage") as any,
  statusController.updateStatus as any,
);

/**
 * @swagger
 * /statuses/{id}:
 *   delete:
 *     summary: Delete status
 *     tags: [Statuses]
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
 *         description: Status deleted
 */
router.delete(
  "/:id",
  requirePermission("statuses:manage") as any,
  statusController.deleteStatus as any,
);

export default router;
