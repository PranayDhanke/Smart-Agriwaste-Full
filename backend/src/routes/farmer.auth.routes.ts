import { Router } from "express";
import {
  createFarmerAccount,
  getFarmerAccount,
  requestFarmerVerification,
  updateFarmerAccount,
} from "../controllers/farmer.auth.controller";
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
  requireAuth(),
  requireRoles(["farmer", "admin"]),
  requireSelfOrAdmin((req) => req.body?.farmerId, ["farmer"]),
  asyncHandler(createFarmerAccount),
);
router.get(
  "/get-account/:id",
  requireAuth(),
  requireSelfOrAdmin((req) => req.params.id, ["farmer"]),
  asyncHandler(getFarmerAccount),
);
router.put(
  "/update-account/:id",
  requireAuth(),
  requireActiveAccount,
  requireSelfOrAdmin((req) => req.params.id, ["farmer"]),
  asyncHandler(updateFarmerAccount)
);
router.post(
  "/request-verification/:id",
  requireAuth(),
  requireActiveAccount,
  requireSelfOrAdmin((req) => req.params.id, ["farmer"]),
  asyncHandler(requestFarmerVerification),
);

export default router;
