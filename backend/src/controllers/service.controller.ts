import { Request, Response } from "express";
import * as serviceService from "../services/service.service.js";

export const createService = async (req: Request, res: Response) => {
  try {
    const performerId = (req as any).user.userId;
    const service = await serviceService.createService(req.body, performerId);
    res.status(201).json(service);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await serviceService.getServices(req.query);
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const performerId = (req as any).user.userId;
    const service = await serviceService.updateService(
      req.params.id,
      req.body,
      performerId,
    );
    res.json(service);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const performerId = (req as any).user.userId;
    await serviceService.deleteService(req.params.id, performerId);
    res.json({ message: "Service deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
