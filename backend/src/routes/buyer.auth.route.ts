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
  requireRoles(["buyer", "admin"]),
  requireSelfOrAdmin((req) => req.body?.buyerId, ["buyer"]),
  asyncHandler(createBuyerAccount),
);
router.get(
  "/get-account/:id",
  requireSelfOrAdmin((req) => req.params.id, ["buyer"]),
  asyncHandler(getBuyerAccount),
);
router.put(
  "/update-account/:id",
  requireActiveAccount,
  requireSelfOrAdmin((req) => req.params.id, ["buyer"]),
  asyncHandler(updateBuyerAccount),
);
router.post(
  "/request-verification/:id",
  requireActiveAccount,
  requireSelfOrAdmin((req) => req.params.id, ["buyer"]),
  asyncHandler(requestBuyerVerification),
);

export default router;
