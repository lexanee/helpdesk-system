import { Request, Response } from "express";
import * as categoryService from "../services/category.service.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("CategoryController");

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategories(req.query);
    res.json(categories);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Get categories error:", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json(category);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Get category error:", { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const performerId = (req as any).user.userId;
    const category = await categoryService.createCategory(
      { name, description },
      performerId,
    );
    res.status(201).json(category);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Create category error:", { error: err.message });
    res.status(400).json({ error: err.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const performerId = (req as any).user.userId;
    const category = await categoryService.updateCategory(
      req.params.id,
      { name, description },
      performerId,
    );
    res.json(category);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Update category error:", { error: err.message });
    res.status(400).json({ error: err.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const performerId = (req as any).user.userId;
    await categoryService.deleteCategory(req.params.id, performerId);
    res.status(204).send();
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Delete category error:", { error: err.message });
    res.status(400).json({ error: err.message });
  }
};

