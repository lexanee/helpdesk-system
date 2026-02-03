import express from "express";
import {
  authenticateToken,
  requirePermission,
} from "../middlewares/auth.middleware.js";
import {
  createRole,
  deleteRole,
  getRoleById,
  getRoles,
  updateRole,
} from "../controllers/role.controller.js";
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
 * /rbac/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [RBAC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of permissions
 */
router.get(
  "/permissions",
  requirePermission("admin:manage_roles") as any,
  getAllPermissions as any,
);

/**
 * @swagger
 * /rbac/permissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     tags: [RBAC]
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
  "/permissions/:id",
  requirePermission("admin:manage_roles") as any,
  getPermissionById as any,
);

/**
 * @swagger
 * /rbac/permissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [RBAC]
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
  "/permissions",
  requirePermission("admin:manage_roles") as any,
  createPermission as any,
);

/**
 * @swagger
 * /rbac/permissions/{id}:
 *   put:
 *     summary: Update permission
 *     tags: [RBAC]
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
  "/permissions/:id",
  requirePermission("admin:manage_roles") as any,
  updatePermission as any,
);

/**
 * @swagger
 * /rbac/permissions/{id}:
 *   delete:
 *     summary: Delete permission
 *     tags: [RBAC]
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
  "/permissions/:id",
  requirePermission("admin:manage_roles") as any,
  deletePermission as any,
);

// Roles
/**
 * @swagger
 * /rbac/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [RBAC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 */
router.get(
  "/roles",
  requirePermission("admin:manage_roles") as any,
  getRoles as any,
);

/**
 * @swagger
 * /rbac/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [RBAC]
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
 *         description: Role details
 *       404:
 *         description: Role not found
 */
router.get(
  "/roles/:id",
  requirePermission("admin:manage_roles") as any,
  getRoleById as any,
);

/**
 * @swagger
 * /rbac/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [RBAC]
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
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Role created
 *       400:
 *         description: Bad request
 */
router.post(
  "/roles",
  requirePermission("admin:manage_roles") as any,
  createRole as any,
);

/**
 * @swagger
 * /rbac/roles/{id}:
 *   put:
 *     summary: Update role
 *     tags: [RBAC]
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
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Role updated
 */
router.put(
  "/roles/:id",
  requirePermission("admin:manage_roles") as any,
  updateRole as any,
);

/**
 * @swagger
 * /rbac/roles/{id}:
 *   delete:
 *     summary: Delete role
 *     tags: [RBAC]
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
 *         description: Role deleted
 */
router.delete(
  "/roles/:id",
  requirePermission("admin:manage_roles") as any,
  deleteRole as any,
);

export default router;
