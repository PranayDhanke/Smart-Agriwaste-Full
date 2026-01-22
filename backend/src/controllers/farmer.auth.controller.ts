import { Request, Response } from "express";
import farmeraccount from "../models/farmer.model";
import { AppError } from "../utils/AppError";

export const createFarmerAccount = async (req: Request, res: Response) => {
  const data = await req.body;

  if (!data) {
    throw new AppError("No data provided", 400);
  }

  const newFarmerAccount = await farmeraccount.create({
    ...data,
  });

  if (!newFarmerAccount) {
    throw new AppError("Failed to create farmer profile", 500);
  }

  res.status(201).json({ status: "Profile created successfully " });
};

export const getFarmerAccount = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) {
    throw new AppError("No farmer ID provided", 400);
  }

  const accountdata = await farmeraccount.findOne({ farmerId: id });

  if (!accountdata) {
    throw new AppError("Farmer profile not found", 404);
  }

  res.status(200).json({ accountdata });
};

export const updateFarmerAccount = async (req: Request, res: Response) => {
  const data = await req.body.data;
  const id = req.params.id;

  if (!data || !id) {
    throw new AppError("Insufficient data provided", 400);
  }

  const updated = await farmeraccount.findOneAndUpdate(
    { farmerId: id },

    { ...data },
    {
      new: true, 
    }
  );

  if (!updated) {
    throw new AppError("Failed to update farmer profile", 500);
  }

  res.status(200).json({ message: "Updated Farmer Profile", data: updated });
};
