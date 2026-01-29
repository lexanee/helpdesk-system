import { Request, Response } from "express";
import * as trashService from "../services/trash.service.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export const getDeletedItems = async (req: Request, res: Response) => {
  try {
    const items = await trashService.getDeletedItems(
      req.params.type,
      req.query as any,
    );
    res.json(items);
  } catch (error: any) {
    if (error.message === "Invalid type") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const restoreItem = async (req: AuthRequest, res: Response) => {
  try {
    const item = await trashService.restoreItem(
      req.params.type,
      req.params.id,
      req.user.userId,
    );
    res.json(item);
  } catch (error: any) {
    if (error.message === "Invalid type") {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === "P2025") {
      // Prisma record not found code
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deletePermanentItem = async (req: AuthRequest, res: Response) => {
  try {
    await trashService.deletePermanentItem(
      req.params.type,
      req.params.id,
      req.user.userId,
    );
    res.status(204).send();
  } catch (error: any) {
    if (error.message === "Invalid type") {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(500).json({ error: error.message });
  }
};
