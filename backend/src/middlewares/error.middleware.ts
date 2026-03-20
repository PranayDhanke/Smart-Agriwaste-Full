import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { isProduction } from "../config/env";
import { logger } from "../config/logger";

export const errorHandler = async (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let status = 500;
  let message = "Internal Server Error";
  let details: unknown;

  if (err instanceof AppError) {
    status = err.statusCode || 500;
    message = err.message;
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    err.name === "ValidationError"
  ) {
    status = 400;
    message = "Validation failed";
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    err.name === "CastError"
  ) {
    status = 400;
    message = "Invalid resource identifier";
  }

  if (!isProduction && err instanceof Error) {
    details = err.stack;
  }

  logger.error("request_failed", {
    requestId: res.locals.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode: status,
    error: err,
  });

  res.status(status).json({
    error: message,
    ...(details ? { details } : {}),
  });
};
