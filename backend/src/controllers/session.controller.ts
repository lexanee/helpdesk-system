import { Request, Response } from "express";
import * as sessionService from "../services/session.service.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await sessionService.getSessions(req.user.userId);
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const revokeSession = async (req: AuthRequest, res: Response) => {
  try {
    const result = await sessionService.revokeSession(
      req.params.id,
      req.user.userId,
      req.headers["user-agent"],
      req.ip,
    );
    res.json(result);
  } catch (error: any) {
    if (error.message === "Session not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const revokeAllSessions = async (req: AuthRequest, res: Response) => {
  try {
    const result = await sessionService.revokeAllSessions(
      req.user.userId,
      req.headers["user-agent"],
      req.ip,
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
