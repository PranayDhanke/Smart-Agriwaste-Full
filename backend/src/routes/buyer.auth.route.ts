import { Router } from "express";
import {
  createBuyerAccount,
  getBuyerAccount,
  requestBuyerVerification,
  updateBuyerAccount,
} from "../controllers/buyer.auth.controller";
import {
  requireActiveAccount,
  requireRoles,
  requireSelfOrAdmin,
} from "../middlewares/authz.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "@clerk/express";

const router = Router();

router.post(
  "/create-account",
  asyncHandler(createBuyerAccount),
);
router.get(
  "/get-account/:id",
  asyncHandler(getBuyerAccount),
);
router.put(
  "/update-account/:id",
  asyncHandler(updateBuyerAccount),
);
router.post(
  "/request-verification/:id",
  asyncHandler(requestBuyerVerification),
);

export default router;
