import { requireAuth } from "@clerk/express";
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  addOrder,
  cancelOrder,
  confirmDelivery,
  confirmOrder,
  getOrderBuyer,
  getOrderFarmer,
  setOutForDelivery,
  viewOrder,
} from "../controllers/order.controller";

const router = Router();

router.post("/create-order", asyncHandler(addOrder));
router.get("/get-order/farmer/:id", asyncHandler(getOrderFarmer));
router.get("/get-order/buyer/:id", asyncHandler(getOrderBuyer));
router.get("/get-order/:id", asyncHandler(viewOrder));
router.patch(
  "/confirm-order/:orderId",

  asyncHandler(confirmOrder),
);
router.patch("/cancel-order/:orderId", asyncHandler(cancelOrder));
router.patch(
  "/confirm-delivery/:id",

  asyncHandler(confirmDelivery),
);
router.patch(
  "/setoutFor-delivered/:id",
  asyncHandler(setOutForDelivery),
);

export default router;
