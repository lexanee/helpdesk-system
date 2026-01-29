import { Router } from "express";
import * as logController from "../controllers/log.controller.js";
import { authenticateToken, requirePermission } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken as any);

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Get activity logs
 *     tags: [Logs]
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
 *         name: entityType
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of logs
 */
router.get("/", 
    requirePermission("admin:manage_logs") as any,
    logController.getLogs as any
);

export default router;
