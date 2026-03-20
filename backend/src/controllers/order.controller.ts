import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { parseCursorPagination } from "../utils/pagination";
import { orderService } from "../services/order.service";

const toSingleParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const addOrder = async (req: Request, res: Response) => {
  const createdOrders = await orderService.createOrders(req.body);

  res.status(201).json({
    message: "Order(s) placed successfully",
    count: createdOrders.length,
    orders: createdOrders,
  });
};

export const confirmOrder = async (req: Request, res: Response) => {
  const orderId = toSingleParam(req.params.orderId);
  if (!orderId) {
    throw new AppError("Id not Provided", 500);
  }

  const order = await orderService.confirmOrder(orderId);

  return res.status(200).json({
    message: "Order confirmed successfully",
    orderId: order._id,
  });
};

export const cancelOrder = async (req: Request, res: Response) => {
  const orderId = toSingleParam(req.params.orderId);
  if (!orderId) {
    throw new AppError("Id not Provided", 500);
  }

  const order = await orderService.cancelOrder(orderId);

  res.status(200).json({
    message: "Order cancelled successfully",
    order,
  });
};

export const confirmDelivery = async (req: Request, res: Response) => {
  const id = toSingleParam(req.params.id);
  const secretCode = String(req.body?.secretCode || "").trim();

  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  if (!secretCode) {
    throw new AppError("Secret code is required", 400);
  }

  await orderService.confirmDelivery(id, secretCode);

  res.status(200).json("Order has been successfully delivered");
};

export const setDeliveryCharge = async (req: Request, res: Response) => {
  const orderId = toSingleParam(req.params.orderId);
  const deliveryCharge = Number(req.body?.deliveryCharge);

  if (!orderId) {
    throw new AppError("Id not Provided", 500);
  }

  if (Number.isNaN(deliveryCharge) || deliveryCharge < 0) {
    throw new AppError("Valid delivery charge is required", 400);
  }

  const order = await orderService.setDeliveryCharge(orderId, deliveryCharge);

  res.status(200).json({
    message: "Delivery charge sent to buyer",
    order,
  });
};

export const reviewOrderPrice = async (req: Request, res: Response) => {
  const orderId = toSingleParam(req.params.orderId);
  const action = req.body?.action;

  if (!orderId) {
    throw new AppError("Id not Provided", 500);
  }

  if (action !== "accept" && action !== "reject") {
    throw new AppError("Valid review action is required", 400);
  }

  const order = await orderService.reviewOrderPrice(orderId, action);

  res.status(200).json({
    message:
      action === "accept"
        ? "Buyer accepted the delivery price"
        : "Buyer rejected the delivery price",
    order,
  });
};

export const getOrderBuyer = async (req: Request, res: Response) => {
  const buyerId = toSingleParam(req.params.id);
  if (!buyerId) {
    throw new AppError("Id not Provided", 500);
  }

  const { cursor, limit } = parseCursorPagination({
    cursor: req.query.cursor,
    limit: req.query.limit,
    defaultLimit: 10,
    maxLimit: 50,
  });

  const { orderData, pagination } = await orderService.listOrders({
    cursor,
    limit,
    buyerId,
  });

  res.status(200).json({
    success: true,
    orderdata: orderData,
    pagination,
  });
};

export const getOrderFarmer = async (req: Request, res: Response) => {
  const farmerId = toSingleParam(req.params.id);
  if (!farmerId) {
    throw new AppError("Id not Provided", 500);
  }

  const { cursor, limit } = parseCursorPagination({
    cursor: req.query.cursor,
    limit: req.query.limit,
    defaultLimit: 10,
    maxLimit: 50,
  });

  const { orderData, pagination } = await orderService.listOrders({
    cursor,
    limit,
    farmerId,
  });

  res.status(200).json({
    success: true,
    orderdata: orderData,
    pagination,
  });
};

export const setOutForDelivery = async (req: Request, res: Response) => {
  const id = toSingleParam(req.params.id);
  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  await orderService.setOutForDelivery(id);
  res.status(200).json("Order has been set Out for delivery");
};

export const viewOrder = async (req: Request, res: Response) => {
  const id = toSingleParam(req.params.id);
  if (!id) {
    throw new AppError("Id not Provided", 500);
  }

  const orderdata = await orderService.getOrderById(id);

  res.status(200).json({ orderdata });
};
