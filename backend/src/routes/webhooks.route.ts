import bodyParser from "body-parser";
import { Router } from "express";
import { handleClerkWebhook } from "../controllers/clerkWebhook.controller";

const router = Router();

router.post("/clerk", bodyParser.raw({ type: "application/json" }), handleClerkWebhook);

export default router;