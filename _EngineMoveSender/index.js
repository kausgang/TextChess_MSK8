const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

//TEMPRARY SATORAGE for moves coming from engine
// const msg_map = new Map();
// const config = {};
// config.enginemovesender_expressport =
//   process.env.TEXTCHESS_ENGINEMOVESENDER_EXPRESSPORT;

// console.log(process.env.TEXTCHESS_ENGINEMOVESENDER_EXPRESSPORT);

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

  console.log("connection established");

  // socket.on("client_emit", (arg) => {
  //   socket.emit("server_emit", arg);
  // });

  socket.emit("clientID", socket.id);
});

httpServer.listen(4000);
// httpServer.listen(config.enginemovesender_expressport);
// httpServer.listen(process.env.TEXTCHESS_ENGINEMOVESENDER_EXPRESSPORT);
