import express from "express";
import {
  authenticateToken,
  requirePermission,
} from "../middlewares/auth.middleware.js";
import {
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionById,
} from "../controllers/permission.controller.js";

const router = express.Router();

router.use(authenticateToken as any);

// Permissions
/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of permissions
 */
router.get(
  "/",
  requirePermission("permissions:manage") as any,
  getAllPermissions as any,
);

/**
 * @swagger
 * /permissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     tags: [Permissions]
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
 *         description: Permission details
 *       404:
 *         description: Permission not found
 */
router.get(
  "/:id",
  requirePermission("permissions:manage") as any,
  getPermissionById as any,
);

/**
 * @swagger
 * /permissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *               - description
 *             properties:
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Permission created
 *       400:
 *         description: Bad request
 */
router.post(
  "/",
  requirePermission("permissions:manage") as any,
  createPermission as any,
);

/**
 * @swagger
 * /permissions/{id}:
 *   put:
 *     summary: Update permission
 *     tags: [Permissions]
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
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permission updated
 */
router.put(
  "/:id",
  requirePermission("permissions:manage") as any,
  updatePermission as any,
);

/**
 * @swagger
 * /permissions/{id}:
 *   delete:
 *     summary: Delete permission
 *     tags: [Permissions]
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
 *         description: Permission deleted
 */
router.delete(
  "/:id",
  requirePermission("permissions:manage") as any,
  deletePermission as any,
);

export default router;
