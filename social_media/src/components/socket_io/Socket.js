// socket.js
import { io } from "socket.io-client";
import { GetTokenFromCookie } from "../getToken/GetToken"

let socket;

try {
  const usr = GetTokenFromCookie();
  
  // Create connection options
  const options = {
    withCredentials: true
  };
  
  // Only add userId to query if user is logged in
  if (usr && usr.id) {
    options.query = { userId: usr.id.toString() };
    console.log("Connecting socket with userId:", usr.id.toString());
  } else {
    console.log("Connecting socket without userId");
  }
  
  socket = io("http://localhost:5000", options);
  
  // Log connection status for debugging
  socket.on("connect", () => {
    console.log("Socket connected successfully with ID:", socket.id);
  });
  
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });
  
} catch (error) {
  console.error("Error initializing socket:", error);
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
