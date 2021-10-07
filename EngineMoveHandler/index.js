//TEMPRARY SATORAGE for moves coming from engine
const msg_map = new Map();

// const { debug, count } = require("console");
//**********************SOCKET PART*************************
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

var cors = require("cors");

// const { config } = require("./CONFIG/config");
const config = {};
config.rabbitMqServer = process.env.TEXTCHESS_RABBITMQSERVER;
// config.receiverQueueName = process.env.TEXTCHESS_TO_ENGINE_Q;
config.queueName = process.env.TEXTCHESS_FROM_ENGINE_Q;
config.expressPort = process.env.TEXTCHESS_ENGINEMOVEHANDLER_EXPRESSPORT;

const app = express();

app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // ...
  console.log("listening " + socket.id);

  const emit = (clientID) => {
    let countIteration = 0;
    const intervalId = setInterval(() => {
      console.log("waiting on engine move");

      // increment the countIteration variable
      ++countIteration;

      // if the countIteration variable has reached 10..it means no response came from engine in 5 seconds
      //let the user know that the engine is down
      if (countIteration == 120) {
        console.log("No engine response received in 1 Minute");

        clearInterval(intervalId);
        socket.emit("noEngine", "Engine is not responding");
      }

      //if a move was put in the temp storage by MQ , then -
      if (msg_map.size != 0) {
        // for debug...write on console
        console.log(
          "sending to clinet " +
            clientID +
            " value = " +
            JSON.stringify(msg_map.get(clientID))
        );

        if (typeof msg_map.get(clientID) != "undefined") {
          // send to client
          socket.emit("move", JSON.stringify(msg_map.get(clientID)));

          // stop waiting for the teporary storage to get the move from MQ
          clearInterval(intervalId);

          // // delete the move from the temporary storage
          // msg_map.delete(clientID);
        }
      }
    }, 500);
  };

  socket.on("madeAMove", emit);

  socket.on("receivedAMove", (clientID) => {
    console.log("Deleting move " + JSON.stringify(msg_map.get(clientID)));
    // delete the move from the temporary storage
    msg_map.delete(clientID);
  });
});

app.get("/", (req, res) => {
  res.send("working");
});

// httpServer.listen(7000);
httpServer.listen(config.expressPort);

// **********************************************************

// RABBITMQ part
// var q = "engine-user";
var q = config.queueName;
// var open = require("amqplib").connect("amqp://localhost");
var open = require("amqplib").connect(config.rabbitMqServer);

// Consumer
open
  .then(function (conn) {
    return conn.createChannel();
  })
  .then(function (ch) {
    return ch.assertQueue(q, { durable: false }).then(function (ok) {
      return ch.consume(q, function (msg) {
        if (msg !== null) {
          // console.log(msg.content.toString());

          let msg_json = JSON.parse(msg.content.toString());

          let engine_move = msg_json.engine_move,
            FEN = msg_json.FEN,
            color = msg_json.color,
            checkmate = msg_json.checkmate,
            stalemate = msg_json.stalemate,
            clientID = msg_json.clientID;

          msg_map.set(clientID, {
            engine_move: engine_move,
            FEN: FEN,
            color: color,
            checkmate: checkmate,
            stalemate: stalemate,
          });

          // console.log(msg_map);

          ch.ack(msg);
        }
      });
    });
  })
  .catch(console.warn);
