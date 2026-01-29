import { NextFunction, Request, Response } from "express";
import xss from "xss";

export const xssMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      req.body = sanitize(req.body);
    }
    if (req.query) {
      sanitizeInPlace(req.query);
    }
    if (req.params) {
      sanitizeInPlace(req.params);
    }
    next();
  };
};

const sanitizeInPlace = (obj: any) => {
  if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      obj[key] = sanitize(obj[key]);
    }
  }
};

const sanitize = (obj: any): any => {
  if (typeof obj === "string") {
    return xss(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (typeof obj === "object" && obj !== null) {
    Object.keys(obj).forEach((key) => {
      obj[key] = sanitize(obj[key]);
    });
  }
  return obj;
};
