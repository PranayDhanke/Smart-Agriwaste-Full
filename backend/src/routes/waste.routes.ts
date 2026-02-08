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

router.post("/create-waste", asyncHandler(addWaste));
router.get("/get-wastes", asyncHandler(getWaste));
router.get("/get-single/:id", asyncHandler(getSingleWaste));
router.get("/get-waste/:id", asyncHandler(getWastebyId));
router.put("/update-waste/:id", asyncHandler(updateWaste));
router.delete("/delete/:id",  asyncHandler(deleteWaste));

export default router;
