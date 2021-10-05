var amqp = require("amqplib");

// const { config } = require("./CONFIG/config");
const config = {};
config.rabbitMqServer = process.env.TEXTCHESS_RABBITMQSERVER;
config.receiverQueueName = process.env.TEXTCHESS_TO_ENGINE_Q;
config.senderQueueName = process.env.TEXTCHESS_FROM_ENGINE_Q;

const e_putInQ = (params) => {
  // console.log("params=" + params);
  amqp
    // .connect("amqp://localhost")
    .connect(config.rabbitMqServer)
    .then(function (conn) {
      return conn
        .createChannel()
        .then(function (ch) {
          // var q = "engine-user";
          var q = config.senderQueueName;
          // var msg = "Hello World!";
          const msg = JSON.stringify({
            engine_move: params.engine_move,
            FEN: params.FEN,
            color: params.color,
            checkmate: params.checkmate,
            stalemate: params.stalemate,
            clientID: params.clientID,
          });
          var ok = ch.assertQueue(q, { durable: false });
          return ok.then(function (_qok) {
            // NB: `sentToQueue` and `publish` both return a boolean
            // indicating whether it's OK to send again straight away, or
            // (when `false`) that you should wait for the event `'drain'`
            // to fire before writing again. We're just doing the one write,
            // so we'll ignore it.
            ch.sendToQueue(q, Buffer.from(msg));
            console.log(" [x] Sent '%s'", msg);
            return ch.close();
          });
        })
        .finally(function () {
          conn.close();
        });
    })
    .catch(console.warn);
};

module.exports = { e_putInQ };
