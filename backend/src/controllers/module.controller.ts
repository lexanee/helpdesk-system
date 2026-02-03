import { Request, Response } from "express";
import * as moduleService from "../services/module.service.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("ModuleController");

export const getAllModules = async (req: Request, res: Response) => {
  try {
    const modules = await moduleService.getAllModules();
    res.json(modules);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Get modules error:", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};
