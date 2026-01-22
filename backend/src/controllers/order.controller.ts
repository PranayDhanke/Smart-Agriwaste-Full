import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import wasteModel from "../models/waste.model";
import orderModel from "../models/order.model";
import mongoose from "mongoose";

export const addOrder = async (req: Request, res: Response) => {
  const data = await req.body.data;
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
      const waste = await wasteModel.findById(item.prodId);

      if (!waste) {
        throw new AppError("Waste item not found", 404);
      }

      totalAmount += waste.price * item.quantity;

      validatedItems.push({
        prodId: waste._id,
        title: waste.title,
        wasteType: waste.wasteType,
        wasteProduct: waste.wasteProduct,
        moisture: waste.moisture,
        quantity: item.quantity,
        price: waste.price,
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

    const order = await orderModel.create({
      buyerId: frontendOrder.buyerId,
      farmerId: frontendOrder.farmerId,
      items: validatedItems,
      totalAmount,
      deliveryMode: frontendOrder.deliveryMode,
      buyerInfo: frontendOrder.buyerInfo,

      // backend controlled
      status: "pending",
      hasPayment: false,
      isDelivered: false,
      isOutForDelivery: false,
      paymentId: "",
    });

    createdOrders.push(order);
  }

  res.status(201).json({
    message: "Order(s) placed successfully",
    count: createdOrders.length,
    orders: createdOrders,
  });
};

export const confirmOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { orderId } = req.params;
    if (!orderId) {
      throw new AppError("Id not Provided", 500);
    }

    /**
     * 1️⃣ Fetch order (only pending + owned by farmer)
     */
    const order = await orderModel
      .findOne({
        _id: orderId,
        status: "pending",
      })
      .session(session);

    if (!order) {
      throw new AppError("Order not found or already processed", 404);
    }

    /**
     * 2️⃣ Validate stock for ALL items
     */
    for (const item of order.items) {
      const waste = await wasteModel.findById(item.prodId).session(session);

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

    /**
     * 3️⃣ Reduce stock (ATOMIC)
     */
    for (const item of order.items) {
      await wasteModel.updateOne(
        { _id: item.prodId },
        { $inc: { quantity: -item.quantity } },
        { session },
      );

      // Check if stock hits zero → mark out of stock
      const updatedWaste = await wasteModel
        .findById(item.prodId)
        .session(session);

      if (updatedWaste && updatedWaste.quantity === 0) {
        await wasteModel.updateOne(
          { _id: item.prodId },
          { isActive: false },
          { session },
        );
      }
    }

    /**
     * 4️⃣ Update order status
     */
    order.status = "confirmed";
    await order.save({ session });

    /**
     * 5️⃣ Commit transaction
     */
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Order confirmed successfully",
      orderId: order._id,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error); // ✅ handled by global AppError handler
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { orderId } = req.params;
  if (!orderId) {
    throw new AppError("Id not Provided", 500);
  }
  await orderModel.findByIdAndUpdate(
    orderId,
    { status: "cancelled" },
    { new: true },
  );
};

export const confirmDelivery = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  await orderModel.findByIdAndUpdate(id, { isDelivered: true }, { new: true });

  res.status(200).json("Order has been successfully delivered");
};

export const getOrderBuyer = async (req: Request, res: Response) => {
  const { cursor } = req.query;
  const limit = Math.min(parseInt(req.query.limit as string) | 10, 50);

  const buyerId = req.params.id;
  if (!buyerId) {
    throw new AppError("Id not Provided", 500);
  }

  const query = cursor ? { buyerId, _id: { $lt: cursor } } : { buyerId };

  const orderdata = await orderModel
    .find(query)
    .sort({ _id: -1 })
    .limit(limit + 1);

  const hasNext = orderdata.length > limit;
  if (hasNext) orderdata.pop();

  res.status(200).json({
    success: true,
    orderdata,
    pagination: {
      nextCursor: hasNext ? orderdata[orderdata.length - 1]._id : null,
      limit,
      hasNext,
    },
  });
};

export const getOrderFarmer = async (req: Request, res: Response) => {
  const { cursor } = req.query;
  const limit = Math.min(parseInt(req.query.limit as string) | 10, 50);

  const farmerId = req.params.id;
  if (!farmerId) {
    throw new AppError("Id not Provided", 500);
  }

  const query = cursor ? { farmerId, _id: { $lt: cursor } } : { farmerId };

  const orderdata = await orderModel
    .find(query)
    .sort({ _id: -1 })
    .limit(limit + 1);

  const hasNext = orderdata.length > limit;
  if (hasNext) orderdata.pop();

  res.status(200).json({
    success: true,
    orderdata,
    pagination: {
      nextCursor: hasNext ? orderdata[orderdata.length - 1]._id : null,
      limit,
      hasNext,
    },
  });
};

export const setOutForDelivery = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  await orderModel.findByIdAndUpdate(
    id,
    { isOutForDelivery: true },
    { new: true },
  );
  res.status(200).json("Order has been set Out for delivery");
};

export const viewOrder = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  const orderdata = await orderModel.findById(id);

  res.status(200).json({ orderdata });
};
