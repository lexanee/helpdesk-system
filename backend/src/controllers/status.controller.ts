import { Request, Response } from "express";
import * as statusService from "../services/status.service.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("StatusController");

export const getAllStatuses = async (req: Request, res: Response) => {
  try {
    const statuses = await statusService.getAllStatuses(req.query);
    res.json(statuses);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Get statuses error:", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

export const getStatusById = async (req: Request, res: Response) => {
  try {
    const status = await statusService.getStatusById(req.params.id);
    res.json(status);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Get status error:", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

export const createStatus = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const performerId = (req as any).user.userId;
    const status = await statusService.createStatus(
      { name, description },
      performerId,
    );
    res.status(201).json(status);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Create status error:", { error: err.message });
    res.status(400).json({ error: err.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const performerId = (req as any).user.userId;
    const status = await statusService.updateStatus(
      req.params.id,
      { name, description },
      performerId,
    );
    res.json(status);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Update status error:", { error: err.message });
    res.status(400).json({ error: err.message });
  }
};

export const deleteStatus = async (req: Request, res: Response) => {
  try {
    const performerId = (req as any).user.userId;
    await statusService.deleteStatus(req.params.id, performerId);
    res.status(204).send();
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Delete status error:", { error: err.message });
    res.status(400).json({ error: err.message });
  }
};

