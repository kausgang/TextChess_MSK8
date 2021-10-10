const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const config = {};
// config.rabbitMqServer = process.env.TEXTCHESS_RABBITMQSERVER;
// config.receiverQueueName = process.env.TEXTCHESS_FROM_ENGINE_Q;
// config.enginemovesender_url = process.env.TEXTCHESS_ENGINEMOVESENDER_URL;
config.enginemovesender_expressport =
  process.env.TEXTCHESS_ENGINEMOVESENDER_EXPRESSPORT;

console.log(config.enginemovesender_expressport);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // ...

  console.log(`client connected ` + socket.id);

  socket.emit("clientID", socket.id);
});

httpServer.listen(config.enginemovesender_expressport);
