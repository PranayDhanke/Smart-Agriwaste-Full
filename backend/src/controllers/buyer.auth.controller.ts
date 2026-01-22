import { Request, Response } from "express";
import buyeraccount from "../models/buyer.model";
import { AppError } from "../utils/AppError";

export const createBuyerAccount = async (req: Request, res: Response) => {
  const data = await req.body;

  if (!data) {
    throw new AppError("No data provided", 400);
  }

  const created = await buyeraccount.create({
    ...data,
  });

  if (!created) {
    throw new AppError("Failed to create buyer profile", 500);
  }

  res
    .status(200)
    .json({ message: "Profile created successfully ", data: created });
};

export const getBuyerAccount = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) {
    throw new AppError("No buyer ID provided", 400);
  }

  const accountdata = await buyeraccount.findOne({ buyerId: id });

  if (!accountdata) {
    throw new AppError("Buyer profile not found", 404);
  }

  res.status(200).json({ accountdata });
};

export const updateBuyerAccount = async (req: Request, res: Response) => {
  const data = req.body.data;
  const id = req.params.id;

  if (!data || !id) {
    throw new AppError("Insufficient data provided", 400);
  }

  const updatedBuyer = await buyeraccount.findOneAndUpdate(
    { buyerId: id },
    { ...data },
    {
      new: true,
    },
  );

  if (!updatedBuyer) {
    throw new AppError("Failed to update buyer profile", 500);
  }

  res.status(200).json("Updated Buyer Profile");
};
