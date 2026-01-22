import { requireAuth } from "@clerk/express";
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  deleteNotification,
  getNotification,
  sendNotification,
  updateRead,
} from "../controllers/notification.controller";

const router = Router();

router.post("/send-notification", requireAuth(), asyncHandler(sendNotification));
router.get("/get-notification/:id", requireAuth(), asyncHandler(getNotification));
router.patch("/read-notification/:id", requireAuth(), asyncHandler(updateRead));
router.delete(
  "/delete-notification/:id",
  requireAuth(),
  asyncHandler(deleteNotification),
);

export default router;
