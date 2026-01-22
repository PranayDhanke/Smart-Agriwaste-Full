import express from "express";
import cors from "cors";
import morgan from "morgan";

import { configDotenv } from "dotenv";
import { errorHandler } from "./middlewares/error.middleware";

import imagekitRoute from "./routes/imagekit.route";
import webhookRoute from "./routes/webhooks.route";
import buyerAuthRoute from "./routes/buyer.auth.route";
import farmerAuthRoute from "./routes/farmer.auth.routes";
import notificationRoute from "./routes/notification.routes";
import negotiationRoute from "./routes/negotiation.routes";
import wasteRoute from "./routes/waste.routes";
import orderRoute from "./routes/order.routes";
import { clerkMiddleware } from "@clerk/express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configDotenv();

const corsOptions = {
  origin: ["http://localhost:3000", "https://smart-agriwaste.vercel.app"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(morgan("dev"));

//routes
app.use("/api/imagekit", imagekitRoute);
app.use("/api/webhooks", webhookRoute);
app.use("/api/buyer", buyerAuthRoute);
app.use("/api/farmer", farmerAuthRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/negotiation", negotiationRoute);
app.use("/api/waste", wasteRoute);
app.use("/api/order", orderRoute);

app.use(errorHandler);

export default app;
