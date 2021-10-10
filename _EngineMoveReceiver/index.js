var amqp = require("amqplib");
// const stockfish = require("stockfish");

// const { config } = require("./CONFIG/config");
// const config = {};
// config.rabbitMqServer = process.env.TEXTCHESS_RABBITMQSERVER;
// config.receiverQueueName = process.env.TEXTCHESS_TO_ENGINE_Q;
// config.senderQueueName = process.env.TEXTCHESS_FROM_ENGINE_Q;

const config = {};
config.rabbitMqServer = process.env.TEXTCHESS_RABBITMQSERVER;
config.receiverQueueName = process.env.TEXTCHESS_FROM_ENGINE_Q;
config.enginemovesender_rul = process.env.TEXTCHESS_ENGINEMOVESENDER_URL;
// config.expressPort = process.env.TEXTCHESS_ENGINEMOVEHANDLER_EXPRESSPORT;

// const { e_putInQ } = require("./sender");

// const { Chess } = require("chess.js");
// const chess = new Chess();

// initialize engine
// const engine = stockfish();

amqp
  .connect(config.rabbitMqServer)
  .then(function (conn) {
    process.once("SIGINT", function () {
      conn.close();
    });
    return conn.createChannel().then(function (ch) {
      var ok = ch.assertQueue(config.receiverQueueName, { durable: false });

      ok = ok.then(function (_qok) {
        return ch.consume(
          config.receiverQueueName,
          function (msg) {
            // console.log(" [x] Received '%s'", msg.content.toString());
            const message = JSON.parse(msg.content.toString());
            console.log(" [x] Received '%s'", message);

            // calculate(message);

            // SEND MESSAGE TO ENGINEMOVESENDER
          },
          { noAck: true }
        );
      });

      return ok.then(function (_consumeOk) {
        console.log(" [*] Waiting for messages. To exit press CTRL+C");
      });
    });
  })
  // .catch(console.warn);
  .catch((err) => {
    console.log("RabbitMQ connection failed");
  });
