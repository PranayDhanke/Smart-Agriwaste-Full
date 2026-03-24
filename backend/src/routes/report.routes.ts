import { requireAuth } from "@clerk/express";
import { Router } from "express";
import { createReport } from "../controllers/report.controller";
import { requireActiveAccount, requireRoles } from "../middlewares/authz.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post(
  "/",
  asyncHandler(createReport),
);

export default router;
