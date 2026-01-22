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
  const id = req.params.id;

  if (!id) {
    throw new AppError("No farmer ID provided", 400);
  }

  const { cursor } = req.query;
  const limit = Math.min(parseInt(req.query.limit as string) | 9, 50);

  const query = cursor
    ? { farmerId: id, _id: { $lt: cursor } }
    : { farmerId: id };

  const negotationData = await negotiation
    .find(query)
    .sort({ _id: -1 })
    .limit(limit + 1);

  const hasNext = negotationData.length > limit;
  if (hasNext) negotationData.pop();

  if (!negotationData) {
    throw new AppError("No negotiation data found for this farmer", 404);
  }

  res.status(200).json({
    success: true,
    data: negotationData,
    pagination: {
      nextCursor: hasNext
        ? negotationData[negotationData.length - 1]._id
        : null,
      limit,
      hasNext,
    },
  });
};

export const getNegotiationsByBuyer = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) {
    throw new AppError("No buyer ID provided", 400);
  }

  const { cursor } = req.query;
  const limit = Math.min(parseInt(req.query.limit as string) | 9, 50);

  const query = cursor
    ? { buyerId: id, _id: { $lt: cursor } }
    : { buyerId: id };

  const negotationData = await negotiation
    .find(query)
    .sort({ _id: -1 })
    .limit(limit + 1);

  if (!negotationData) {
    throw new AppError("No negotiation data found for this buyer", 404);
  }

  const hasNext = negotationData.length > limit;
  if (hasNext) negotationData.pop();

  res.status(200).json({
    success: true,
    data: negotationData,
    pagination: {
      nextCursor: hasNext
        ? negotationData[negotationData.length - 1]._id
        : null,
      limit,
      hasNext,
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
