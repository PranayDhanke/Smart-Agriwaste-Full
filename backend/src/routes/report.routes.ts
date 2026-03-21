import { requireAuth } from "@clerk/express";
import { Router } from "express";
import { createReport } from "../controllers/report.controller";
import { requireActiveAccount, requireRoles } from "../middlewares/authz.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post(
  "/",
  requireAuth(),
  requireRoles(["buyer", "farmer", "admin"]),
  requireActiveAccount,
  asyncHandler(createReport),
);

export default router;
