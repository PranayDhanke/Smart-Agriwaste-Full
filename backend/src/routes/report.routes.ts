import { requireAuth } from "@clerk/express";
import { Router } from "express";
import { createReport, getMyReports } from "../controllers/report.controller";
import { requireActiveAccount } from "../middlewares/authz.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/mine",
  requireAuth(),
  requireActiveAccount,
  asyncHandler(getMyReports),
);

router.post(
  "/",
  requireAuth(),
  requireActiveAccount,
  asyncHandler(createReport),
);

export default router;
