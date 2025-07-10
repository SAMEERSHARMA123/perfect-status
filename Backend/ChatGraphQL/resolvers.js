const chatSchema = require("./chatSchema");

module.exports = {
  Query: {
    getMessages: async (_, { senderId, receiverId }) => {
      try {
        // Step 1: Dono users ke beech jitne bhi messages hain (A -> B ya B -> A)
        const messages = await chatSchema.find({
          $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId },
          ],
        }).sort({ createdAt: 1 }); // Step 2: Oldest to newest

        try {
          const formattedMessages = messages.map(msg => ({
            ...msg._doc,
            id: msg._id.toString(),
            sender: {
              ...msg.sender._doc,
              id: msg.sender._id.toString()
            },
            receiver: {
              ...msg.receiver._doc,
              id: msg.receiver._id.toString()
            }
          }));
          console.log(formattedMessages);
          return formattedMessages;
        } catch (error) {
          console.error("Error formatting messages:", error);
          // Return unformatted messages as fallback
          return messages;
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        throw new Error("Failed to fetch messages");
      }
    },
  },

  Mutation: {
    sendMessage: async (_, { senderId, receiverId, message }, context) => {
      try {
        const { io } = context;
        // Step 1: Message ko MongoDB me save karo
        const newMsg = await chatSchema.create({
          sender: senderId,
          receiver: receiverId,
          message: message,
        });

        try {
          const populatedMsg = await newMsg.populate("sender receiver");
          
          // Step 2: Real-time socket emit to receiver (agar socket connected hai)
          try {
            if (io) {
              io.to(receiverId).emit("receiveMessage", newMsg);
            }
          } catch (socketError) {
            console.error("Error emitting socket message:", socketError);
            // Continue execution even if socket fails
          }
          
          // Step 3: Message ko GraphQL mutation response me return karo
          return populatedMsg;
        } catch (populateError) {
          console.error("Error populating message:", populateError);
          return newMsg; // Return unpopulated message as fallback
        }
      } catch (error) {
        console.error("Error sending message:", error);
        throw new Error("Failed to send message");
      }
    },
  },
};




