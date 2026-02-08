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

router.post("/send-notification",  asyncHandler(sendNotification));
router.get("/get-notification/:id", asyncHandler(getNotification));
router.patch("/read-notification/:id", asyncHandler(updateRead));
router.delete(
  "/delete-notification/:id",
  asyncHandler(deleteNotification),
);

export default router;
