import { Request, Response } from "express";
import waste from "../models/waste.model";
import { translateText } from "../lib/azureTranslation";
import { AppError } from "../utils/AppError";
import { loadavg } from "node:os";

export const addWaste = async (req: Request, res: Response) => {
  
  const data = await req.body;

  if (!data) {
    throw new AppError("Waste data not found", 500);
  }

  const title = await translateText(data.title, ["en", "hi", "mr"]);
  const description = await translateText(data.description, ["en", "hi", "mr"]);

  // Save documentnp
  const createdWaste = await waste.create({
    ...data,
    title,
    description,
    createdAt: new Date(), // timestamp
  });

  if (!createdWaste) {
    throw new AppError("Waste is not added", 500);
  }

  res.status(200).json({ status: "success" });
};

export const getWastebyId = async (req: Request, res: Response) => {
   const id = req.params.id;

  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  const { cursor } = req.query;
  const limit = Math.min(parseInt(req.query.limit as string) || 12, 50);

  const query = cursor
    ? { "seller.farmerId": id, _id: { $lt: cursor } }
    : { "seller.farmerId": id };

  const wastedata = await waste
    .find(query)
    .sort({ _id: -1 })
    .limit(limit + 1);

  const hasNext = wastedata.length > limit;
  if (hasNext) wastedata.pop();

  if (!wastedata) {
    throw new AppError("Error occur while findidng waste", 500);
  }

  res.status(200).json({
    success: true,
    wastedata,
    pagination: {
      nextCursor: hasNext ? wastedata[wastedata.length - 1]._id : null,
      limit,
      hasNext,
    },
  });
};

export const getWaste = async (req: Request, res: Response) => {
  const { cursor } = req.query;
  const limit = Math.min(parseInt(req.query.limit as string) || 12, 50);

  const query = cursor ? { _id: { $lt: cursor } } : {};

  const wastedata = await waste
    .find(query)
    .sort({ _id: -1 })
    .limit(limit + 1);

  const hasNext = wastedata.length > limit;
  if (hasNext) wastedata.pop();

  if (!wastedata) {
    throw new AppError("Error while fetching the waste", 500);
  }

  res.status(200).json({
    success: true,
    wastedata,
    pagination: {
      nextCursor: hasNext ? wastedata[wastedata.length - 1]._id : null,
      limit,
      hasNext,
    },
  });
};

export const deleteWaste = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  const deleted = await waste.findOneAndDelete({ _id: id });

  if (!deleted) {
    throw new AppError("Error while deleting the waste", 500);
  }

  res.status(200).json({ message: "Deleted successfully" });
};

export const getSingleWaste = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  const singleWaste = await waste.findById(id);

  if (!singleWaste) {
    throw new AppError("Can not fetch the single waste", 500);
  }

  return res.status(200).json({ singleWaste });
};

export const updateWaste = async (req: Request, res: Response) => {
  const id = req.params.id;
  const data = await req.body.data;

  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  if (!data) {
    throw new AppError("Waste data not found", 500);
  }

  const title = await translateText(data.title, ["en", "hi", "mr"]);
  const description = await translateText(data.description, ["en", "hi", "mr"]);

  const updatedWaste = await waste.findByIdAndUpdate(
    id,
    { $set: { ...data, title, description } },
    { new: true },
  );

  if (!updatedWaste) {
    throw new AppError("Waste not updated", 500);
  }

  res.status(200).json({ message: "Waste updated successfully", updatedWaste });
};
