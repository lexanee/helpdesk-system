import { Request, Response } from "express";
import * as permissionService from "../services/permission.service.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await permissionService.getAllPermissions(req.query);
    res.json(permissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const permission = await permissionService.getPermissionById(req.params.id);
    res.json(permission);
  } catch (error: any) {
    if (error.message === "Permission not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const createPermission = async (req: AuthRequest, res: Response) => {
  try {
    const permission = await permissionService.createPermission(
      req.body,
      req.user.userId,
    );
    res.status(201).json(permission);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updatePermission = async (req: AuthRequest, res: Response) => {
  try {
    const permission = await permissionService.updatePermission(
      req.params.id,
      req.body,
      req.user.userId,
    );
    res.json(permission);
  } catch (error: any) {
    if (error.message === "Permission not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

export const deletePermission = async (req: AuthRequest, res: Response) => {
  try {
    await permissionService.deletePermission(req.params.id, req.user.userId);
    res.json({ message: "Permission deleted" });
  } catch (error: any) {
    if (error.message === "Permission not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};
