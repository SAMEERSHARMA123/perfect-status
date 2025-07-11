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
  
  // Create socket with reconnection options
  socket = io("http://localhost:5000", {
    ...options,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  });
  
  // Log connection status for debugging
  socket.on("connect", () => {
    console.log("Socket connected successfully with ID:", socket.id);
    
    // Re-join room on reconnection if user is logged in
    const user = GetTokenFromCookie();
    if (user && user.id) {
      console.log("Re-joining room after connection with ID:", user.id.toString());
      socket.emit("join", user.id.toString());
    }
  });
  
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });
  
  socket.on("reconnect", (attemptNumber) => {
    console.log(`Socket reconnected after ${attemptNumber} attempts`);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    
    // Attempt to reconnect
    setTimeout(() => {
      socket.connect();
    }, 1000);
  });
  
  // Keep-alive ping
  setInterval(() => {
    if (socket.connected) {
      socket.emit('ping');
    }
  }, 25000);
  
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
