import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  addWaste,
  deleteWaste,
  getSingleWaste,
  getWaste,
  getWastebyId,
  updateWaste,
} from "../controllers/waste.controller";
import { requireAuth } from "@clerk/express";

const router = Router();

router.post("/create-waste", requireAuth(), asyncHandler(addWaste));
router.get("/get-wastes", asyncHandler(getWaste));
router.get("/get-single/:id", asyncHandler(getSingleWaste));
router.get("/get-waste/:id", requireAuth(), asyncHandler(getWastebyId));
router.put("/update-waste/:id", requireAuth(), asyncHandler(updateWaste));
router.delete("/delete/:id", requireAuth(), asyncHandler(deleteWaste));

export default router;
