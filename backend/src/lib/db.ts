import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../config/logger";

export const mongoConnect = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(env.mongoUri);
  logger.info("mongo_connected");
  return mongoose.connection;
};

export const mongoDisconnect = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("mongo_disconnected");
  }
};

export const isMongoReady = () => mongoose.connection.readyState === 1;
