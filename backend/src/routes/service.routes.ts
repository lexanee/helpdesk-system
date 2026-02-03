import { Router } from "express";
import * as serviceController from "../controllers/service.controller.js";
import {
  authenticateToken,
  requirePermission,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken as any);

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
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
 *         description: Service created
 *       400:
 *         description: Bad request
 */
router.post(
  "/",
  requirePermission("services:manage") as any,
  serviceController.createService as any,
);

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of services
 */
router.get("/", serviceController.getServices as any);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update service
 *     tags: [Services]
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
 *         description: Service updated
 */
router.put(
  "/:id",
  requirePermission("services:manage") as any,
  serviceController.updateService as any,
);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete service
 *     tags: [Services]
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
 *         description: Service deleted
 */
router.delete(
  "/:id",
  requirePermission("services:manage") as any,
  serviceController.deleteService as any,
);

export default router;
