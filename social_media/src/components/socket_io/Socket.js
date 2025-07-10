// socket.js
import { io } from "socket.io-client";
import {GetTokenFromCookie} from "../getToken/GetToken"
const usr = GetTokenFromCookie();
  
let socket;

try {
  socket = io("http://localhost:5000",{query: { userId: usr.id.toString() },
    withCredentials: true,
  });
} catch (error) {
  console.error("Error connecting to socket server:", error);
  // Provide a fallback socket-like object to prevent app crashes
  socket = {
    on: () => {},
    off: () => {},
    emit: () => {},
    connect: () => {},
    disconnect: () => {}
  };
}

export default socket;
