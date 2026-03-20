import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

export const requestContext = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const headerValue = req.header("x-request-id");
  const requestId = headerValue && headerValue.trim() ? headerValue : randomUUID();

  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  next();
};
