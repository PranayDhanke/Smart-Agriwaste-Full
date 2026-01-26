import { Request, Response } from "express";
import negotiation from "../models/negotiation.model";
import { AppError } from "../utils/AppError";

export const listNegotiations = async (req: Request, res: Response) => {
  const data = await req.body.data;
  if (!data) {
    throw new AppError("No data provided", 400);
  }

  const createdNegotiation = await negotiation.create({
    ...data,
    createdAt: new Date(),
  });

  if (!createdNegotiation) {
    throw new AppError("Failed to log negotiation request", 500);
  }

  res.status(200).json({ message: "Negotiation request logged successfully" });
};

export const getNegotiationsByFarmer = async (req: Request, res: Response) => {
  const farmerId = req.params.id;

  if (!farmerId) {
    throw new AppError("No farmer ID provided", 400);
  }

  const { cursor, status, search, limit: limitRaw } = req.query;

  const limit = Math.min(Number(limitRaw) || 5, 50);

  const baseFilter: any = { farmerId };

  if (search) {
    baseFilter.$or = [
      { "item.title.en": { $regex: search, $options: "i" } },
      { buyerName: { $regex: search, $options: "i" } },
    ];
  }

  /* 🔢 GLOBAL STATS (no cursor!) */
  const [pending, accepted, rejected] = await Promise.all([
    negotiation.countDocuments({ ...baseFilter, status: "pending" }),
    negotiation.countDocuments({ ...baseFilter, status: "accepted" }),
    negotiation.countDocuments({ ...baseFilter, status: "rejected" }),
  ]);

  /* 🧠 PAGINATED QUERY (with status + cursor) */
  const pageFilter: any = { ...baseFilter };

  if (status) pageFilter.status = status;
  if (cursor) pageFilter._id = { $lt: cursor };

  const negotiations = await negotiation
    .find(pageFilter)
    .sort({ _id: -1 })
    .limit(limit + 1);

  const hasNext = negotiations.length > limit;
  if (hasNext) negotiations.pop();

  res.status(200).json({
    success: true,
    data: negotiations,
    stats: {
      pending,
      accepted,
      rejected,
      total: pending + accepted + rejected,
    },
    pagination: {
      hasNext,
      nextCursor: hasNext ? negotiations[negotiations.length - 1]._id : null,
      limit,
    },
  });
};

export const getNegotiationsByBuyer = async (req: Request, res: Response) => {
  const buyerId = req.params.id;

  if (!buyerId) {
    throw new AppError("No farmer ID provided", 400);
  }

  const { cursor, status, search, limit: limitRaw } = req.query;

  const limit = Math.min(Number(limitRaw) || 5, 50);

  const baseFilter: any = { buyerId };

  if (search) {
    baseFilter.$or = [
      { "item.title.en": { $regex: search, $options: "i" } },
      { buyerName: { $regex: search, $options: "i" } },
    ];
  }

  /* 🔢 GLOBAL STATS (no cursor!) */
  const [pending, accepted, rejected] = await Promise.all([
    negotiation.countDocuments({ ...baseFilter, status: "pending" }),
    negotiation.countDocuments({ ...baseFilter, status: "accepted" }),
    negotiation.countDocuments({ ...baseFilter, status: "rejected" }),
  ]);

  /* 🧠 PAGINATED QUERY (with status + cursor) */
  const pageFilter: any = { ...baseFilter };

  if (status) pageFilter.status = status;
  if (cursor) pageFilter._id = { $lt: cursor };

  const negotiations = await negotiation
    .find(pageFilter)
    .sort({ _id: -1 })
    .limit(limit + 1);

  const hasNext = negotiations.length > limit;
  if (hasNext) negotiations.pop();
  res.status(200).json({
    success: true,
    data: negotiations,
    stats: {
      pending,
      accepted,
      rejected,
      total: pending + accepted + rejected,
    },
    pagination: {
      hasNext,
      nextCursor: hasNext ? negotiations[negotiations.length - 1]._id : null,
      limit,
    },
  });
};

export const updateNegotiationStatus = async (req: Request, res: Response) => {
  const { id, status } = await req.body;

  if (!id || !status) {
    throw new AppError("Insufficient data provided", 400);
  }
  const updatedNegotiation = await negotiation.findByIdAndUpdate(id, {
    status: status,
  });

  if (!updatedNegotiation) {
    throw new AppError("Failed to update negotiation status", 500);
  }

  res.status(200).json({ success: true });
};
