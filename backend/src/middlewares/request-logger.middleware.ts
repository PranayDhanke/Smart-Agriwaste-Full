import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const contentLength = res.getHeader("content-length");

    logger.info("http_request", {
      requestId: res.locals.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip: req.ip,
      userAgent: req.get("user-agent"),
      contentLength: contentLength ? Number(contentLength) : undefined,
    });
  });

  next();
};
