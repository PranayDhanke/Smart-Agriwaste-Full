import mongoose from "mongoose";
import { orderRepository } from "../repositories/order.repository";
import { wasteRepository } from "../repositories/waste.repository";
import { AppError } from "../utils/AppError";

interface FrontendOrderItem {
  prodId: string;
  quantity: number;
  price?: number;
}

interface FrontendOrder {
  buyerId: string;
  farmerId: string;
  deliveryMode: string;
  buyerInfo: Record<string, unknown>;
  items: FrontendOrderItem[];
}

interface CreateOrdersPayload {
  data: FrontendOrder[];
}

interface PaginatedOrderQuery {
  cursor?: string;
  limit: number;
  buyerId?: string;
  farmerId?: string;
}

const generateSixDigitCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const orderService = {
  async createOrders(payload: CreateOrdersPayload) {
    const data = payload?.data;

    if (!data) {
      throw new AppError("Waste data not found", 500);
    }

    if (!Array.isArray(data) || data.length === 0) {
      throw new AppError("Order data not found", 500);
    }

    const createdOrders = [];

    for (const frontendOrder of data) {
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of frontendOrder.items) {
        const waste = await wasteRepository.findById(item.prodId);

        if (!waste) {
          throw new AppError("Waste item not found", 404);
        }

        const unitPrice =
          typeof item.price === "number" && item.price > 0 ? item.price : waste.price;

        totalAmount += unitPrice * item.quantity;

        validatedItems.push({
          prodId: waste._id,
          title: waste.title,
          wasteType: waste.wasteType,
          wasteProduct: waste.wasteProduct,
          moisture: waste.moisture,
          quantity: item.quantity,
          price: unitPrice,
          unit: waste.unit,
          description: waste.description,
          image: waste.imageUrl,
          sellerInfo: {
            seller: {
              farmerId: waste.seller?.farmerId,
              farmerName: waste.seller?.name,
            },
            address: waste.address,
          },
        });
      }

      const order = await orderRepository.create({
        buyerId: frontendOrder.buyerId,
        farmerId: frontendOrder.farmerId,
        items: validatedItems,
        subTotalAmount: totalAmount,
        totalAmount,
        deliveryCharge: 0,
        deliveryMode: frontendOrder.deliveryMode,
        pricingStatus:
          frontendOrder.deliveryMode === "DELIVERYBYFARMER"
            ? "pending_farmer_input"
            : "not_required",
        deliverySecretCode: generateSixDigitCode(),
        deliveryCodeRecipient:
          frontendOrder.deliveryMode === "DELIVERYBYFARMER" ? "buyer" : "farmer",
        buyerInfo: frontendOrder.buyerInfo,
        status: "pending",
        hasPayment: false,
        isDelivered: false,
        isOutForDelivery: false,
        paymentId: "",
      });

      createdOrders.push(order);
    }

    return createdOrders;
  },

  async confirmOrder(orderId: string) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const order = await orderRepository.findPendingById(orderId, session);

      if (!order) {
        throw new AppError("Order not found or already processed", 404);
      }

      if (
        order.deliveryMode === "DELIVERYBYFARMER" &&
        order.pricingStatus !== "accepted"
      ) {
        throw new AppError(
          "Buyer must approve the delivery charge before confirmation",
          409,
        );
      }

      for (const item of order.items) {
        const waste = await wasteRepository.findById(item.prodId, session);

        if (!waste) {
          throw new AppError("Waste item not found", 404);
        }

        if (!waste.isActive) {
          throw new AppError(`${item.title} is out of stock`, 409);
        }

        if (waste.quantity < item.quantity) {
          throw new AppError(`Insufficient quantity for ${item.title}`, 409);
        }
      }

      for (const item of order.items) {
        await wasteRepository.decrementQuantity(item.prodId, item.quantity, session);

        const updatedWaste = await wasteRepository.findById(item.prodId, session);
        if (updatedWaste && updatedWaste.quantity === 0) {
          await wasteRepository.setInactive(item.prodId, session);
        }
      }

      order.status = "confirmed";
      await orderRepository.save(order, session);

      await session.commitTransaction();

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async cancelOrder(orderId: string) {
    const cancelledOrder = await orderRepository.findByIdAndUpdate(orderId, {
      status: "cancelled",
    });

    if (!cancelledOrder) {
      throw new AppError("Order not found", 404);
    }

    return cancelledOrder;
  },

  async confirmDelivery(orderId: string, secretCode: string) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.deliverySecretCode !== secretCode) {
      throw new AppError("Invalid secret code", 400);
    }

    order.isDelivered = true;
    await orderRepository.save(order);

    return order;
  },

  async setDeliveryCharge(orderId: string, deliveryCharge: number) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.deliveryMode !== "DELIVERYBYFARMER") {
      throw new AppError("Delivery charge is only allowed for farmer delivery", 400);
    }

    if (order.status !== "pending") {
      throw new AppError("Delivery charge can only be set for pending orders", 409);
    }

    order.deliveryCharge = deliveryCharge;
    order.totalAmount = order.subTotalAmount + deliveryCharge;
    order.pricingStatus = "pending_buyer_review";

    await orderRepository.save(order);

    return order;
  },

  async reviewOrderPrice(orderId: string, action: "accept" | "reject") {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.deliveryMode !== "DELIVERYBYFARMER") {
      throw new AppError("Price review is only required for farmer delivery", 400);
    }

    if (order.pricingStatus !== "pending_buyer_review") {
      throw new AppError("There is no pending delivery quote to review", 409);
    }

    if (action === "accept") {
      order.pricingStatus = "accepted";
    } else {
      order.pricingStatus = "rejected";
      order.status = "cancelled";
    }

    await orderRepository.save(order);

    return order;
  },

  async listOrders({ cursor, limit, buyerId, farmerId }: PaginatedOrderQuery) {
    const orderData = await orderRepository.findMany({
      cursor,
      limit,
      buyerId,
      farmerId,
    });

    const hasNext = orderData.length > limit;
    if (hasNext) orderData.pop();

    return {
      orderData,
      pagination: {
        nextCursor: hasNext ? orderData[orderData.length - 1]?._id : null,
        limit,
        hasNext,
      },
    };
  },

  async setOutForDelivery(orderId: string) {
    const order = await orderRepository.findByIdAndUpdate(orderId, {
      isOutForDelivery: true,
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    return order;
  },

  async getOrderById(orderId: string) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    return order;
  },
};
