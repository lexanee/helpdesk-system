import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import * as logService from "../services/log.service.js";

export const getLogs = async (req: AuthRequest, res: Response) => {
  try {
    const ticketId = req.query.ticketId as string;
    const userId = req.query.userId as string;

    let filters: any = {};
    if (req.user.role !== "administrator") {
      filters.userId = req.user.userId;
    } else {
      if (userId) filters.userId = userId;
    }

    if (ticketId) filters.ticketId = ticketId;

    const result = await logService.getLogs(req.query, filters);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
