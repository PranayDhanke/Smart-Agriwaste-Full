import { ClientSession } from "mongoose";
import orderModel from "../models/order.model";

export interface FindOrdersOptions {
  cursor?: string;
  limit: number;
  buyerId?: string;
  farmerId?: string;
}

export const orderRepository = {
  async create(payload: Record<string, unknown>) {
    return orderModel.create(payload);
  },

  async findById(id: string) {
    return orderModel.findById(id);
  },

  async findPendingById(id: string, session: ClientSession) {
    return orderModel
      .findOne({
        _id: id,
        status: "pending",
      })
      .session(session);
  },

  async save(order: any, session?: ClientSession) {
    return order.save(session ? { session } : undefined);
  },

  async findByIdAndUpdate(id: string, payload: Record<string, unknown>) {
    return orderModel.findByIdAndUpdate(id, payload, { new: true });
  },

  async findMany({ cursor, limit, buyerId, farmerId }: FindOrdersOptions) {
    const query: Record<string, unknown> = {};

    if (buyerId) {
      query.buyerId = buyerId;
    }

    if (farmerId) {
      query.farmerId = farmerId;
    }

    if (cursor) {
      query._id = { $lt: cursor };
    }

    return orderModel
      .find(query)
      .sort({ _id: -1 })
      .limit(limit + 1);
  },
};
