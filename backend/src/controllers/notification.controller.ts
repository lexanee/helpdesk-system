import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import * as notificationService from "../services/notification.service.js";

export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const result = await notificationService.getUserNotifications(
      userId,
      req.query,
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    await notificationService.markAsRead(id, userId);
    res.json({ message: "Marked as read" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    await notificationService.markAllAsRead(userId);
    res.json({ message: "All marked as read" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
