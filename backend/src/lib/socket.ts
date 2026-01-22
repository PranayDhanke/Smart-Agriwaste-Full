import { Server, Socket } from "socket.io";
import { createMessage, getMessages } from "../controllers/messages.controller";

let io: Server | null = null;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000/", "https://smart-agriwaste.vercel.app/"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);
    setUser(socket);
  });
};

const setUser = (socket: Socket) => {
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
      console.error("send-message error:", err);
      socket.emit("send-error", { message: "Could not save/send message" });
    }
  });

  socket.on("leave-room", () => {
    socket.leave("main-room");
  });

  socket.on("disconnect", (reason) => {
    console.log("disconnect", socket.id, reason);
  });
};
