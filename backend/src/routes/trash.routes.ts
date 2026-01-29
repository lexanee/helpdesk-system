import { Router } from "express";
import {
  deletePermanentItem,
  getDeletedItems,
  restoreItem,
} from "../controllers/trash.controller.js";
import {
  authenticateToken,
  requirePermission,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken as any);

/**
 * @swagger
 * /trash/{type}:
 *   get:
 *     summary: Get deleted items
 *     tags: [Trash]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [users, tickets, services, categories, statuses, priorities]
 *     responses:
 *       200:
 *         description: List of deleted items
 */
router.get(
  "/:type",
  requirePermission("admin:manage_trash") as any,
  getDeletedItems as any,
);

/**
 * @swagger
 * /trash/{type}/{id}/restore:
 *   post:
 *     summary: Restore deleted item
 *     tags: [Trash]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [users, tickets, services, categories, statuses, priorities]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item restored
 */
router.post(
  "/:type/:id/restore",
  requirePermission("admin:manage_trash") as any,
  restoreItem as any,
);

/**
 * @swagger
 * /trash/{type}/{id}:
 *   delete:
 *     summary: Permanently delete item
 *     tags: [Trash]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [users, tickets, services, categories, statuses, priorities]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Item deleted permanently
 */
router.delete(
  "/:type/:id",
  requirePermission("admin:manage_trash") as any,
  deletePermanentItem as any,
);

export default router;
