import { Request, Response } from "express";
import * as userService from "../services/user.service.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("UserController");

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers(req.query);
    res.json(users);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Get users error:", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Get user error:", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Create user error:", { error: err.message });
    res.status(400).json({ error: err.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Update user error:", { error: err.message });
    res.status(400).json({ error: err.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.body;
    const performerId = (req as any).user.userId;
    const user = await userService.updateUserRole(
      req.params.id,
      roleId,
      performerId,
      req.ip,
    );
    res.json(user);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Update user role error:", { error: err.message });
    res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const performerId = (req as any).user.userId;
    await userService.deleteUser(req.params.id, performerId, req.ip);
    res.status(204).send();
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Delete user error:", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

