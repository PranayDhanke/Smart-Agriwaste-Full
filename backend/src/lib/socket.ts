import { Server, Socket } from "socket.io";
import { createMessage, getMessages } from "../controllers/messages.controller";
import { env } from "../config/env";
import { logger } from "./logger";

let io: Server | null = null;
export const getUserSocketRoom = (userId: string) => `user:${userId}`;
export const getIO = () => io;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: env.corsOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.info("socket_connected", { socketId: socket.id });
    setUser(socket);
  });
};

const setUser = (socket: Socket) => {
  socket.on("register-user", (userId: string) => {
    if (!userId) return;
    socket.join(getUserSocketRoom(String(userId)));
  });

  socket.on("join-room", async () => {
    const ROOM = "main-room";
    socket.join(ROOM);
    const hisMes = await getMessages();
    socket.emit("history", hisMes);
  });

  socket.on("send-message", async (payload) => {
    try {
      if (!payload || !payload.message) return;

      const text = String(payload.message).slice(0, 2000);
      const username = payload.username
        ? String(payload.username).slice(0, 100)
        : "anonymous";
      const userid = payload.userid ? String(payload.userid) || "" : "";

      const saved = await createMessage({
        message: text,
        username,
        userid,
      });
      if (io === null) return;
      io.to("main-room").emit("receive-message", {
        _id: saved._id,
        message: saved.message,
        username: saved.username,
        userid: saved.userId,
        createdAt: saved.createdAt,
      });
    } catch (err) {
      logger.error("socket_send_message_failed", {
        socketId: socket.id,
        error: err,
      });
      socket.emit("send-error", { message: "Could not save/send message" });
    }
  });

  socket.on("leave-room", () => {
    socket.leave("main-room");
  });

  socket.on("disconnect", (reason) => {
    logger.info("socket_disconnected", { socketId: socket.id, reason });
  });
};
