import { createContext } from "react";
import { io } from "socket.io-client";

const ENDPOINT =
  process.env.NODE_ENV === "production"
    ? "https://dopuni2.herokuapp.com"
    : "http://localhost:3001";
export const socket = io(ENDPOINT);
export const SocketContext = createContext(socket);
