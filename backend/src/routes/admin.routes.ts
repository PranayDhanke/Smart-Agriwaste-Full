import { requireAuth } from "@clerk/express";
import { Router } from "express";
import {
  bootstrapAdmin,
  deleteManagedUser,
  getReports,
  deleteWasteAsAdmin,
  getAdminAccount,
  getAdminDashboard,
  getAdminUsers,
  updateReportStatus,
  updateUserBanStatus,
  updateUserVerificationStatus,
} from "../controllers/admin.controller";
import { requireRoles, requireSelfOrAdmin } from "../middlewares/authz.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/bootstrap", requireAuth(), asyncHandler(bootstrapAdmin));
router.get(
  "/get-account/:id",
  requireAuth(),
  requireSelfOrAdmin((req) => req.params.id, ["admin"]),
  asyncHandler(getAdminAccount),
);
router.get("/dashboard", requireAuth(), requireRoles(["admin"]), asyncHandler(getAdminDashboard));
router.get("/users", requireAuth(), requireRoles(["admin"]), asyncHandler(getAdminUsers));
router.patch(
  "/users/:role/:userId/ban",
  requireAuth(),
  requireRoles(["admin"]),
  asyncHandler(updateUserBanStatus),
);
router.delete(
  "/users/:role/:userId",
  requireAuth(),
  requireRoles(["admin"]),
  asyncHandler(deleteManagedUser),
);
router.patch(
  "/users/:role/:userId/verification",
  requireAuth(),
  requireRoles(["admin"]),
  asyncHandler(updateUserVerificationStatus),
);
router.delete(
  "/wastes/:id",
  requireAuth(),
  requireRoles(["admin"]),
  asyncHandler(deleteWasteAsAdmin),
);
router.get("/reports", requireAuth(), requireRoles(["admin"]), asyncHandler(getReports));
router.patch(
  "/reports/:id",
  requireAuth(),
  requireRoles(["admin"]),
  asyncHandler(updateReportStatus),
);

export default router;
