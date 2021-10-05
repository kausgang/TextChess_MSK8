var amqp = require("amqplib");
const stockfish = require("stockfish");

// const { config } = require("./CONFIG/config");
const config = {};
config.rabbitMqServer = process.env.TEXTCHESS_RABBITMQSERVER;
config.receiverQueueName = process.env.TEXTCHESS_TO_ENGINE_Q;
config.senderQueueName = process.env.TEXTCHESS_FROM_ENGINE_Q;

const { e_putInQ } = require("./sender");

const { Chess } = require("chess.js");
const chess = new Chess();

// initialize engine
const engine = stockfish();

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

            calculate(message);
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

function calculate(message) {
  let engine_level = message.engine_level,
    FEN = message.FEN,
    clientID = message.clientID;

  // find which side to move
  chess.load(FEN);
  let color = chess.turn();

  // find the engine response to the position it received
  engine.postMessage("position fen " + FEN);
  engine.postMessage("go depth " + engine_level * 3); // this is where engine is calculating}
  engine.onmessage = (line) => {
    if (line.indexOf("bestmove") > -1) {
      engine_move = line.match(/bestmove\s+(\S+)/);

      console.log("engineMove[1]=" + engine_move[1]);

      // find the engine move in UCI
      var engine_response_UCI = engine_move[1];

      // chess.load(FEN);

      // // move the piece
      var engine_response = chess.move(engine_response_UCI, { sloppy: true });

      console.log("engineResponse=" + engine_response.san);
      // // find the SAN move
      var SAN_move = engine_response.san;

      // // find FEN
      var newFEN = chess.fen();
      // console.log(newFEN);

      let checkmate = chess.in_checkmate();
      let stalemate = chess.in_stalemate();

      // put engine move and newFEN in queue in SAN format
      e_putInQ({
        engine_move: SAN_move,
        FEN: newFEN,
        color: color,
        checkmate: checkmate,
        stalemate: stalemate,
        clientID: clientID,
      });
    }
  };
}
