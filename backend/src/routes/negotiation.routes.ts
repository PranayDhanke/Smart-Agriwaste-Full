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
  asyncHandler(getNegotiationsByFarmer),
);
router.get(
  "/get-negotiation/buyer/:id",
  asyncHandler(getNegotiationsByBuyer),
);
router.patch(
  "/update-status",
  asyncHandler(updateNegotiationStatus),
);

export default router;
