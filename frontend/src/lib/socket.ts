"use client";

import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  "https://smartagriwasteapi.azurewebsites.net/api";

let socket: Socket | null = null;
let registeredUserId: string | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      if (registeredUserId) {
        socket?.emit("register-user", registeredUserId);
      }
    });
  }

  return socket;
};

export const connectSocketForUser = (userId?: string | null) => {
  const currentSocket = getSocket();

  if (!currentSocket.connected) {
    currentSocket.connect();
  }

  if (userId) {
    registeredUserId = userId;

    if (currentSocket.connected) {
      currentSocket.emit("register-user", userId);
    } else {
      currentSocket.once("connect", () => {
        currentSocket.emit("register-user", userId);
      });
    }
  }

  return currentSocket;
};
