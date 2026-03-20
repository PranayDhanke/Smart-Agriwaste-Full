"use client";

import { io, Socket } from "socket.io-client";

import { publicEnv } from "@/config/env";

const SOCKET_URL = publicEnv.socketUrl;

let socket: Socket | null = null;
let registeredUserId: string | null = null;

const attachDefaultListeners = (currentSocket: Socket) => {
  currentSocket.on("connect", () => {
    if (registeredUserId) {
      currentSocket.emit("register-user", registeredUserId);
    }
  });

  currentSocket.on("connect_error", (error) => {
    console.error("Socket connect error:", error.message);
  });

  currentSocket.on("disconnect", (reason) => {
    console.warn("Socket disconnected:", reason);
  });
};

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    attachDefaultListeners(socket);
  }

  return socket;
};

export const connectSocketForUser = (userId?: string | null) => {
  const currentSocket = getSocket();

  if (userId) {
    registeredUserId = userId;
  }

  if (!currentSocket.active) {
    currentSocket.connect();
  }

  if (registeredUserId && currentSocket.connected) {
    currentSocket.emit("register-user", registeredUserId);
  }

  return currentSocket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
