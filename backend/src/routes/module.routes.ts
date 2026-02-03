import express from "express";
import {
  authenticateToken,
  requirePermission,
} from "../middlewares/auth.middleware.js";
import { getAllModules } from "../controllers/module.controller.js";

const router = express.Router();

router.use(authenticateToken as any);

/**
 * @swagger
 * /modules:
 *   get:
 *     summary: Get all modules with permissions
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of modules
 */
router.get(
  "/",
  // Any authenticated user might need this for UI, or strictly admin?
  // Let's assume admins/agents managing roles need it.
  requirePermission("roles:manage") as any,
  getAllModules as any,
);

export default router;
