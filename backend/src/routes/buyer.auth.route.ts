import { Router } from "express";
import {
  createBuyerAccount,
  getBuyerAccount,
  updateBuyerAccount,
} from "../controllers/buyer.auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "@clerk/express";

const router = Router();

router.post("/create-account", asyncHandler(createBuyerAccount));
router.get("/get-account/:id", requireAuth(), asyncHandler(getBuyerAccount));
router.put(
  "/update-account/:id",
  requireAuth(),
  asyncHandler(updateBuyerAccount),
);

export default router;
