import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  addWaste,
  deleteWaste,
  getSingleWaste,
  getWaste,
  getWastebyId,
  updateWaste,
} from "../controllers/waste.controller";
import {
  requireActiveAccount,
  requireWasteCreatorOrAdmin,
  requireWasteOwnerOrAdmin,
} from "../middlewares/authz.middleware";

const router = Router();

router.post(
  "/create-waste",
  requireActiveAccount,
  requireWasteCreatorOrAdmin,
  asyncHandler(addWaste),
);
router.get("/get-wastes", asyncHandler(getWaste));
router.get("/get-single/:id", asyncHandler(getSingleWaste));
router.get("/get-waste/:id", asyncHandler(getWastebyId));
router.put(
  "/update-waste/:id",
  requireActiveAccount,
  requireWasteOwnerOrAdmin,
  asyncHandler(updateWaste),
);
router.delete(
  "/delete/:id",
  requireActiveAccount,
  requireWasteOwnerOrAdmin,
  asyncHandler(deleteWaste),
);

export default router;
