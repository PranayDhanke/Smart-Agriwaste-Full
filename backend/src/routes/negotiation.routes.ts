import { Router } from "express";
import {
  getNegotiationsByBuyer,
  getNegotiationsByFarmer,
  listNegotiations,
  updateNegotiationStatus,
} from "../controllers/negotiation.controller";
import { requireAuth } from "@clerk/express";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/add-negotiation", requireAuth(), asyncHandler(listNegotiations));
router.get(
  "/get-negotiation/farmer/:id",
  requireAuth(),
  asyncHandler(getNegotiationsByFarmer),
);
router.get(
  "/get-negotiation/buyer/:id",
  requireAuth(),
  asyncHandler(getNegotiationsByBuyer),
);
router.patch(
  "/update-status",
  requireAuth(),
  asyncHandler(updateNegotiationStatus),
);

export default router;
