import { ClientSession } from "mongoose";
import wasteModel from "../models/waste.model";

export interface FindWasteOptions {
  cursor?: string;
  limit: number;
  farmerId?: string;
}

export const wasteRepository = {
  async create(payload: Record<string, unknown>) {
    return wasteModel.create(payload);
  },

  async findById(id: string, session?: ClientSession) {
    const query = wasteModel.findById(id);
    return session ? query.session(session) : query;
  },

  async findMany({ cursor, limit, farmerId }: FindWasteOptions) {
    const query: Record<string, unknown> = farmerId
      ? { "seller.farmerId": farmerId }
      : {};

    if (cursor) {
      query._id = { $lt: cursor };
    }

    return wasteModel
      .find(query)
      .sort({ _id: -1 })
      .limit(limit + 1);
  },

  async findOneAndDelete(id: string) {
    return wasteModel.findOneAndDelete({ _id: id });
  },

  async findByIdAndUpdate(id: string, update: Record<string, unknown>) {
    return wasteModel.findByIdAndUpdate(id, update, { new: true });
  },

  async decrementQuantity(id: string, quantity: number, session: ClientSession) {
    return wasteModel.updateOne(
      { _id: id },
      { $inc: { quantity: -quantity } },
      { session },
    );
  },

  async setInactive(id: string, session: ClientSession) {
    return wasteModel.updateOne({ _id: id }, { isActive: false }, { session });
  },
};
