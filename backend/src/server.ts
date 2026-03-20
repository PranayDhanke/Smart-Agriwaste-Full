import app from "./app";
import { env } from "./config/env";
import { mongoConnect, mongoDisconnect } from "./lib/db";
import { initSocket } from "./lib/socket";
import { logger } from "./lib/logger";
import http from "http";

const startServer = async () => {
  try {
    const server = http.createServer(app);

    await mongoConnect();
    initSocket(server);

    server.listen(env.port, () => {
      logger.info("server_started", { port: env.port });
    });

    const shutdown = async (signal: NodeJS.Signals) => {
      logger.info("shutdown_signal_received", { signal });

      server.close(async () => {
        await mongoDisconnect();
        logger.info("server_shutdown_complete");
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("forced_shutdown_timeout", { timeoutMs: 10000 });
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error("server_start_failed", { error });
    process.exit(1);
  }
};

startServer();
