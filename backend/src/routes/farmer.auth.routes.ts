import { Router } from "express";
import {
  createFarmerAccount,
  getFarmerAccount,
  updateFarmerAccount,
} from "../controllers/farmer.auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "@clerk/express";

const router = Router();

router.post("/create-account", asyncHandler(createFarmerAccount));
router.get("/get-account/:id", asyncHandler(getFarmerAccount));
router.put(
  "/update-account/:id",
  asyncHandler(updateFarmerAccount)
);

export default router;
