import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  getSessions,
  revokeAllSessions,
  revokeSession,
} from "../controllers/session.controller.js";

const router = express.Router();

router.use(authenticateToken as any);

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Get active sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sessions
 */
router.get("/", getSessions as any);

/**
 * @swagger
 * /sessions/{id}:
 *   delete:
 *     summary: Revoke session
 *     tags: [Sessions]
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
 *         description: Session revoked
 */
router.delete("/:id", revokeSession as any);

/**
 * @swagger
 * /sessions:
 *   delete:
 *     summary: Revoke all sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions revoked
 */
router.delete("/", revokeAllSessions as any);

export default router;
