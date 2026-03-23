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
  asyncHandler(createFarmerAccount),
);
router.get(
  "/get-account/:id",
  asyncHandler(getFarmerAccount),
);
router.put(
  "/update-account/:id",
  asyncHandler(updateFarmerAccount)
);
router.post(
  "/request-verification/:id",
  asyncHandler(requestFarmerVerification),
);

export default router;
