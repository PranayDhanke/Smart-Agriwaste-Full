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

router.post("/create-order", requireAuth(), asyncHandler(addOrder));
router.get("/get-order/farmer/:id", requireAuth(), asyncHandler(getOrderFarmer));
router.get("/get-order/buyer/:id", requireAuth(), asyncHandler(getOrderBuyer));
router.get("/get-order/:id", requireAuth(), asyncHandler(viewOrder));
router.patch(
  "/confirm-order/:orderId",
  requireAuth(),
  asyncHandler(confirmOrder),
);
router.patch("/cancel-order/:orderId", requireAuth(), asyncHandler(cancelOrder));
router.patch(
  "/confirm-delivery/:id",
  requireAuth(),
  asyncHandler(confirmDelivery),
);
router.patch(
  "/setoutFor-delivered/:id",
  requireAuth(),
  asyncHandler(setOutForDelivery),
);

export default router;
