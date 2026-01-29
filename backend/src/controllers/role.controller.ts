import { Request, Response } from "express";
import * as roleService from "../services/role.service.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await roleService.getRoles(req.query);
    res.json(roles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    res.json(role);
  } catch (error: any) {
    if (error.message === "Role not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const createRole = async (req: AuthRequest, res: Response) => {
  try {
    const role = await roleService.createRole(req.body, req.user.userId);
    res.status(201).json(role);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const role = await roleService.updateRole(
      req.params.id,
      req.body,
      req.user.userId,
    );
    res.json(role);
  } catch (error: any) {
    if (error.message === "Role not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

export const deleteRole = async (req: AuthRequest, res: Response) => {
  try {
    await roleService.deleteRole(req.params.id, req.user.userId);
    res.json({ message: "Role deleted" });
  } catch (error: any) {
    if (error.message === "Role not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};
