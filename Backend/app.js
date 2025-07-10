// const express = require('express');
// const cors = require('cors');
// const cookieParser = require("cookie-parser");
// const { ApolloServer } = require('apollo-server-express');
// const { graphqlUploadExpress } = require('graphql-upload');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// // Import DB connection, typedefs, resolvers
// const DB = require('./DB/db');
// const userTypeDefs = require('./UserGraphQL/typeDefs');
// const userResolvers = require('./UserGraphQL/resolvers');
// const chatTypeDefs = require('./ChatGraphQL/typeDefs');
// const chatResolvers = require('./ChatGraphQL/resolvers');


// // Connect to MongoDB
// DB();

// const app = express();
// app.use(cookieParser()); // ✅ Cookie parser middleware
// const port = process.env.PORT || 5000;

// // ✅ Global CORS (for non-GQL routes)
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
// }));

// // ✅ File upload middleware
// app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

// // Log incoming /graphql POST requests for debugging
// app.use('/graphql', express.json(), (req, res, next) => {
//   if (req.method === 'POST') {
//     console.log('--- Incoming /graphql request body ---');
//     console.log(JSON.stringify(req.body, null, 2));
//   }
//   next();
// });

// // ✅ Apollo Server Setup
// async function startServer() {
//   const server = new ApolloServer({
//    typeDefs: [userTypeDefs, chatTypeDefs],   // ✅ combined
//   resolvers: [userResolvers, chatResolvers],
//     context: ({ req, res }) => {
     
//       const token = req.cookies.token;
//       const io = req.app.get("io");

//       if (!token) return { req, res, io };

//       try {
//         const user = jwt.verify(token, process.env.JWT_SECRET);
//         return { req, res, user, io }; // ✅ user + res in context
//       } catch (err) {
//         return { req, res, io };
//       }
//     },
//   });

//   await server.start();

//   // ✅ Apollo middleware with CORS
//   server.applyMiddleware({
//     app,
//     cors: {
//       origin: 'http://localhost:3000',
//       credentials: true,
//     },
//   });

//   // ✅ Optional health check
//   app.get('/', (req, res) => {
//     res.send('🚀 Server is running...');
//   });

//   // ✅ Start Express server
//   app.listen(port, () => {
//     console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
//   });
// }

// startServer();




const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const { ApolloServer } = require('apollo-server-express');
const { graphqlUploadExpress } = require('graphql-upload');
const jwt = require('jsonwebtoken');
const http = require('http'); // ✅ Required for socket.io
const { Server } = require('socket.io');

require('dotenv').config();

// DB + TypeDefs + Resolvers
const DB = require('./DB/db');
const userTypeDefs = require('./UserGraphQL/typeDefs');
const userResolvers = require('./UserGraphQL/resolvers');
const chatTypeDefs = require('./ChatGraphQL/typeDefs');
const chatResolvers = require('./ChatGraphQL/resolvers');

// Connect DB
DB();

const app = express();
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

// Optional: GraphQL request logger
app.use('/graphql', express.json(), (req, res, next) => {
  if (req.method === 'POST') {
    console.log('📦 Incoming GraphQL Query:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Create HTTP server (for Socket.io)
const httpServer = http.createServer(app);

// Initialize socket.io
let io;
try {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
    },
  });
} catch (error) {
  console.error("Error initializing Socket.io server:", error);
  // Create a dummy io object to prevent crashes
  io = {
    on: () => {},
    emit: () => {},
    to: () => ({ emit: () => {} })
  };
}

// Store `io` inside Express
app.set("io", io);

const onlineUsers = new Map();
// Handle socket connections
io.on("connection", (socket) => {
  try {
    const userId = socket.handshake.query.userId;
    if(userId) {
      try {
        console.log("⚡ Socket connected:", socket.id);
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        socket.join(userId);
        
        io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
      } catch (error) {
        console.error("Error handling socket connection:", error);
      }
    }
    
    socket.on("join", (userId) => {
      try {
        socket.join(userId);
        socket.userId = userId;
        onlineUsers.set(userId, socket.id);
        console.log(`🟢 User joined room: ${userId}`);
        io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
        
      } catch (error) {
        console.error("Error handling socket join:", error);
      }
    });

    socket.on("disconnect", () => {
      try {
        console.log("❌ Socket disconnected:", socket.id);
        if (socket.userId) {
          onlineUsers.delete(socket.userId); // ❌ remove user from online list
          io.emit("updateOnlineUsers", Array.from(onlineUsers.keys())); // 🔁 broadcast update
        }
      } catch (error) {
        console.error("Error handling socket disconnect:", error);
      }
    });
  } catch (error) {
    console.error("Error in socket connection handler:", error);
  }
});

// Start Apollo Server
async function startServer() {
  const server = new ApolloServer({
    typeDefs: [userTypeDefs, chatTypeDefs],
    resolvers: [userResolvers, chatResolvers],
    context: ({ req, res }) => {
      const token = req.cookies.token;
      const io = req.app.get("io");

      if (!token) return { req, res, io };

      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        return { req, res, user, io };
      } catch (err) {
        return { req, res, io };
      }
    },
  });

  await server.start();

  server.applyMiddleware({
    app,
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
    },
  });

   app.get('/', (req, res) => {
    res.send('🚀 Server is running...');
  });

  httpServer.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Apollo GraphQL running at http://localhost:5000${server.graphqlPath}`);
    console.log(`🔌 Socket.io running on same server`);
  });
}

startServer();

