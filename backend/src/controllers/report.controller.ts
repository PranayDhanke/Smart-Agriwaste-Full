import { Request, Response } from "express";
import reportModel from "../models/report.model";
import { getRequestActor } from "../middlewares/authz.middleware";
import { AppError } from "../utils/AppError";

export const createReport = async (req: Request, res: Response) => {
  const actor = await getRequestActor(req);
  const { targetType, targetId, reason, description } = req.body as {
    targetType?: "buyer" | "farmer" | "waste";
    targetId?: string;
    reason?: string;
    description?: string;
  };

  if (!targetType || !targetId || !reason) {
    throw new AppError("Target type, target id, and reason are required", 400);
  }

  const report = await reportModel.create({
    reporterId: actor.userId,
    reporterRole: actor.role === "guest" ? "buyer" : actor.role,
    targetType,
    targetId,
    reason,
    description: description ?? "",
  });

  res.status(201).json({
    message: "Report submitted successfully",
    report,
  });
};
