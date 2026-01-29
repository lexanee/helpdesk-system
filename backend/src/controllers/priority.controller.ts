import { Request, Response } from "express";
import * as priorityService from "../services/priority.service.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export const getPriorities = async (req: Request, res: Response) => {
  try {
    const priorities = await priorityService.getPriorities();
    res.json(priorities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPriorityById = async (req: Request, res: Response) => {
  try {
    const priority = await priorityService.getPriorityById(req.params.id);
    res.json(priority);
  } catch (error: any) {
    if (error.message === "Priority not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const createPriority = async (req: AuthRequest, res: Response) => {
  try {
    const priority = await priorityService.createPriority(
      req.body,
      req.user.userId,
    );
    res.status(201).json(priority);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updatePriority = async (req: AuthRequest, res: Response) => {
  try {
    const priority = await priorityService.updatePriority(
      req.params.id,
      req.body,
      req.user.userId,
    );
    res.json(priority);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePriority = async (req: AuthRequest, res: Response) => {
  try {
    await priorityService.deletePriority(req.params.id, req.user.userId);
    res.json({ message: "Priority deleted" });
  } catch (error: any) {
    if (error.message === "Priority not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};
