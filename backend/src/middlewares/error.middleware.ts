import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { stat } from "node:fs";

export const errorHandler = async (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let status = 500;
  let message = "Internal Server Error";

  if (err instanceof AppError) {
    status = err.statusCode || 500;
    message = err.message;
  }
  console.log("Error:", err);
  res.status(status).json({ error: message });
};
