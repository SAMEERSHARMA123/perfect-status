const { gql } = require("apollo-server-express");

const typeDefs = gql`

  type Message {
    id: ID!
    sender: User!
    receiver: User!
    message: String!
    createdAt: String!
  }

  type Query {
    getMessages(senderId: ID!, receiverId: ID!): [Message]
  }

  type Mutation {
    sendMessage(senderId: ID!, receiverId: ID!, message: String!): Message
  }
`;

module.exports = typeDefs;
