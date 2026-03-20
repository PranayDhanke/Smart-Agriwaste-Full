import { toLocalizedFields } from "../lib/localizedText";
import { wasteRepository } from "../repositories/waste.repository";
import { AppError } from "../utils/AppError";

interface WastePayload {
  title: string;
  description: string;
  [key: string]: unknown;
}

interface WastePaginationInput {
  cursor?: string;
  limit: number;
  farmerId?: string;
}

export const wasteService = {
  async createWaste(payload: WastePayload) {
    if (!payload) {
      throw new AppError("Waste data not found", 500);
    }

    const translatedFields = toLocalizedFields({
      title: payload.title,
      description: payload.description,
    });

    const createdWaste = await wasteRepository.create({
      ...payload,
      title: translatedFields.title,
      description: translatedFields.description,
      createdAt: new Date(),
    });

    if (!createdWaste) {
      throw new AppError("Waste is not added", 500);
    }

    return createdWaste;
  },

  async listWaste({ cursor, limit, farmerId }: WastePaginationInput) {
    const wasteData = await wasteRepository.findMany({
      cursor,
      limit,
      farmerId,
    });

    const hasNext = wasteData.length > limit;
    if (hasNext) wasteData.pop();

    return {
      wasteData,
      pagination: {
        nextCursor: hasNext ? wasteData[wasteData.length - 1]?._id : null,
        limit,
        hasNext,
      },
    };
  },

  async getWasteById(id: string) {
    const singleWaste = await wasteRepository.findById(id);

    if (!singleWaste) {
      throw new AppError("Can not fetch the single waste", 500);
    }

    return singleWaste;
  },

  async deleteWaste(id: string) {
    const deleted = await wasteRepository.findOneAndDelete(id);

    if (!deleted) {
      throw new AppError("Error while deleting the waste", 500);
    }

    return deleted;
  },

  async updateWaste(id: string, payload: WastePayload) {
    if (!payload) {
      throw new AppError("Waste data not found", 500);
    }

    const translatedFields = toLocalizedFields({
      title: payload.title,
      description: payload.description,
    });

    const updatedWaste = await wasteRepository.findByIdAndUpdate(id, {
      $set: {
        ...payload,
        title: translatedFields.title,
        description: translatedFields.description,
      },
    });

    if (!updatedWaste) {
      throw new AppError("Waste not updated", 500);
    }

    return updatedWaste;
  },
};
