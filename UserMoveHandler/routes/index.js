var express = require("express");
var router = express.Router();
const { Chess } = require("chess.js");
const chess = new Chess();

router.post("/", (req, res, next) => {
  // res.send(JSON.stringify({ move: req.body.move }));
  // send ackowledgement
  let FEN = req.body.FEN;
  // let move = req.body.move;
  let isUserBlack = req.body.isUserBlack;
  let firstMove_User = req.body.firstMove_User;

  if (!firstMove_User) {
    // console.log("here");
    res.locals.newFEN = FEN;
    res.status(200).send({
      illegalMove: false,
      FEN: res.locals.newFEN,
      checkmate: res.locals.checkmate,
      stalemate: res.locals.stalemate,
    });
    next();
  } else {
    // load the FEN that came from client
    chess.load(FEN);

    let move = req.body.move;
    res.locals.move = move;

    // validate user move
    var validate = chess.move(move, { sloppy: true });

    // pass the new FEN to rabbitMqSender middleware
    res.locals.newFEN = chess.fen();

    res.locals.checkmate = chess.in_checkmate();
    res.locals.stalemate = chess.in_stalemate();

    //if illegal move was entered , send error
    if (validate == null) {
      res.status(400).send({ illegalMove: true, error: "Illegal Move" });

      // let the next middleware (rabbitMqReceiver) know that an illegal move has been made.
      // Do not send this move to queue
      res.locals.illegalMove = true;
      console.log("Illegal move received..not putting move to queue");
    }

    // make user move and update the board
    else {
      res.status(200).send({
        illegalMove: false,
        FEN: res.locals.newFEN,
        checkmate: res.locals.checkmate,
        stalemate: res.locals.stalemate,
      });

      res.locals.illegalMove = false;
    }

    // let rabbitMqSender put usermove, fen and engine level in queue
    next();
  }
});
module.exports = router;
