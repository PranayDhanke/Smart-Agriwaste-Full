import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { clerkMiddleware } from "@clerk/express";
import { env } from "./config/env";
import { isMongoReady } from "./lib/db";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { requestContext } from "./middlewares/request-context.middleware";
import { requestLogger } from "./middlewares/request-logger.middleware";
import { openApiSpec } from "./docs/openapi";

import imagekitRoute from "./routes/imagekit.route";
import webhookRoute from "./routes/webhooks.route";
import buyerAuthRoute from "./routes/buyer.auth.route";
import farmerAuthRoute from "./routes/farmer.auth.routes";
import adminRoute from "./routes/admin.routes";
import notificationRoute from "./routes/notification.routes";
import negotiationRoute from "./routes/negotiation.routes";
import reportRoute from "./routes/report.routes";
import wasteRoute from "./routes/waste.routes";
import orderRoute from "./routes/order.routes";
import communityRoute from "./routes/community.routes";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: env.corsOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(requestContext);
app.use(requestLogger);

app.use(clerkMiddleware());

app.get("/", (_req, res) => {
  res.json({
    message: "Smart Agriwaste backend is running",
    environment: env.nodeEnv,
  });
});

app.get("/health", (_req, res) => {
  const ready = isMongoReady();

  res.status(ready ? 200 : 503).json({
    status: ready ? "ok" : "degraded",
    database: ready ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/live", (_req, res) => {
  res.status(200).json({
    status: "ok",
    check: "liveness",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/ready", (_req, res) => {
  const mongoReady = isMongoReady();

  res.status(mongoReady ? 200 : 503).json({
    status: mongoReady ? "ok" : "degraded",
    check: "readiness",
    dependencies: {
      mongo: mongoReady ? "connected" : "disconnected",
    },
    timestamp: new Date().toISOString(),
  });
});

app.get("/openapi.json", (_req, res) => {
  res.status(200).json(openApiSpec);
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

//routes
app.use("/api/imagekit", imagekitRoute);
app.use("/api/webhooks", webhookRoute);
app.use("/api/buyer", buyerAuthRoute);
app.use("/api/farmer", farmerAuthRoute);
app.use("/api/admin", adminRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/negotiation", negotiationRoute);
app.use("/api/report", reportRoute);
app.use("/api/waste", wasteRoute);
app.use("/api/order", orderRoute);
app.use("/api/community", communityRoute);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
