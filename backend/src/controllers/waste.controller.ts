import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { parseCursorPagination } from "../utils/pagination";
import { wasteService } from "../services/waste.service";

const toSingleParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const addWaste = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data) {
    throw new AppError("Waste data not found", 500);
  }

  await wasteService.createWaste(data);

  res.status(200).json({ status: "success" });
};

export const getWastebyId = async (req: Request, res: Response) => {
  const id = toSingleParam(req.params.id);

  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  const { cursor, limit } = parseCursorPagination({
    cursor: req.query.cursor,
    limit: req.query.limit,
    defaultLimit: 12,
    maxLimit: 50,
  });

  const { wasteData, pagination } = await wasteService.listWaste({
    cursor,
    limit,
    farmerId: id,
  });

  res.status(200).json({
    success: true,
    wastedata: wasteData,
    pagination,
  });
};

export const getWaste = async (req: Request, res: Response) => {
  const { cursor, limit } = parseCursorPagination({
    cursor: req.query.cursor,
    limit: req.query.limit,
    defaultLimit: 12,
    maxLimit: 50,
  });

  const { wasteData, pagination } = await wasteService.listWaste({
    cursor,
    limit,
  });

  res.status(200).json({
    success: true,
    wastedata: wasteData,
    pagination,
  });
};

export const deleteWaste = async (req: Request, res: Response) => {
  const id = toSingleParam(req.params.id);

  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  await wasteService.deleteWaste(id);

  res.status(200).json({ message: "Deleted successfully" });
};

export const getSingleWaste = async (req: Request, res: Response) => {
  const id = toSingleParam(req.params.id);

  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  const singleWaste = await wasteService.getWasteById(id);

  return res.status(200).json({ singleWaste });
};

export const updateWaste = async (req: Request, res: Response) => {
  const id = toSingleParam(req.params.id);
  const data = req.body.data;

  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  const updatedWaste = await wasteService.updateWaste(id, data);

  res.status(200).json({ message: "Waste updated successfully", updatedWaste });
};
