const amqp = require("amqplib");
// const config = require("../CONFIG/config");
// require("../CONFIG/config");
const config = {};
config.rabbitMqServer = process.env.TEXTCHESS_RABBITMQSERVER;
config.queueName = process.env.TEXTCHESS_TO_ENGINE_Q;
// config.senderQueueName = process.env.TEXTCHESS_FROM_ENGINE_Q;

// console.log(config.rabbitMqServer);

const putInQ = (req, res, next) => {
  // console.log("inside testfn");
  // next();

  if (!res.locals.illegalMove) {
    amqp
      // .connect("amqp://localhost")
      .connect(config.rabbitMqServer)
      .then(function (conn) {
        return conn
          .createChannel()
          .then(function (ch) {
            // var q = "user-engine";
            var q = config.queueName;

            let FEN = res.locals.newFEN;
            // let move = req.body.move;
            let move = res.locals.move;
            let engine_level = req.body.engine_level,
              clientID = req.body.clientID;

            const msg = JSON.stringify({
              move: move,
              FEN: FEN,
              engine_level: engine_level,
              clientID: clientID,
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
  }
};

module.exports = { putInQ };
