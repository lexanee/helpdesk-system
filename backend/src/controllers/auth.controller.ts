import { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { isProduction } from "../config/env.config.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("AuthController");

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);

    // Set refresh token cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set access token cookie
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(201).json(result);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Registration error:", { error: err.message });
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);

    // Set refresh token cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set access token cookie
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies["refreshToken"];
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.json({ message: "Logged out successfully" });
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const user = await authService.getProfile(userId);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const changePassword = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        error: "Old and new password are required",
      });
    }

    const result = await authService.changePassword(
      userId,
      oldPassword,
      newPassword,
    );
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies["refreshToken"];
    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const { accessToken } = await authService.refresh(refreshToken);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({ message: "Token refreshed" });
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
};
