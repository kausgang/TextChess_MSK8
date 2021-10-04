let move_counter = 0,
  tabindex = 1,
  FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; //start position
let isUserBlack = false;
let firstMove_User = true;

jQuery(() => {
  // generate client ID
  clientID = uuidv4();

  // access config data like this
  // console.log(config.url);

  // load chess board
  let board_1 = Chessboard("board1", "start");
  let board_2 = Chessboard("board2", "clear");

  // // OPEN SOCKET connection
  // const socket = io("http://localhost:7000/");
  const socket = io.connect(config.engineMoveHandlerURL);

  hideBoards();

  showHideBoard();

  showHideEmptyBoard();

  goToMove(board_1);

  arrowNavigate(board_1);

  // copy fen
  $("#copy_fen").on("click", () => {
    $("#copy_fen").attr("data-clipboard-text", FEN);
    new ClipboardJS("#copy_fen");
    alert("FEN copied to clipboard");
  });

  // export PGN
  $("#export_pgn").on("click", exportPgn);

  //if no engine move was made in a given time
  socket.on("noEngine", () => {
    console.log("Engine is not responding");
    alert("Engine is not responding\nFix Engine error and restart the game");
  });

  // cliecked you-play-as-black button
  $("#play_as_black").on("click", () => {
    isUserBlack = true;

    //set the board orientation as black
    board_1.orientation("black");

    // // disable play-as-black
    $("#play_as_black").prop("disabled", true);

    try {
      let engine_level = $("#engine_level").val();
      // send empty move to userMoveHandler
      postMove(config.userMoveHandlerURL, {
        move: "",
        FEN: FEN,
        engine_level: engine_level,
        isUserBlack: isUserBlack,
        firstMove_User: false,
        clientID: clientID,
      })
        .then((data) => {
          if (!data.illegalMove) {
            //inform that the client has made a move and send clientID along with it
            socket.emit("madeAMove", clientID);
          } else alert("Illegal Move, Chess moves are case sensetive");
        })
        .catch((error) => {
          alert("UserMoveHandler returned error");
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  });

  // when move is entered in the form input field
  $("#input").on("keydown", (event) => {
    // collect engine level
    let engine_level = $("#engine_level").val();
    // if enter key was pressed after entering move
    if (event.key == "Enter") {
      // // disable play-as-black if not done already
      $("#play_as_black").prop("disabled", true);

      // 1. get the move from input field and empty the input field
      let move = $("#input").val();
      $("#input").val("");
      // 2. prevent entering blank value
      if (move == "") {
        alert("enter valid move");
        return;
      }

      try {
        // // if a string was entered, send it to user-move-handler microservice
        postMove(config.userMoveHandlerURL, {
          move: move,
          FEN: FEN,
          engine_level: engine_level,
          isUserBlack: isUserBlack,
          firstMove_User: firstMove_User,
          clientID: clientID,
        })
          .then((data) => {
            // if valid move - update table and load chessboard
            if (!data.illegalMove) {
              updateTable(
                move,
                data.FEN,
                isUserBlack,
                board_1,
                data.checkmate,
                data.stalemate
              );

              //inform that the client has made a move and send clientID along with it
              socket.emit("madeAMove", clientID);
            } else alert("Illegal Move, Chess moves are case sensetive");
          })
          .catch((error) => {
            alert("UserMoveHandler returned error");
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    }
  });

  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  async function postMove(url, data) {
    const fetchOption = {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    const response = await fetch(url, fetchOption);
    return response.json();
  }

  // receive events from socket server
  // THE EVENTNAME THAT SERVER IS SENDING IS "move"
  socket.on("move", (engineMove) => {
    let moveObject = JSON.parse(engineMove);

    // console.log(moveObject);

    let move = moveObject.engine_move;
    let FEN = moveObject.FEN;
    let color = moveObject.color;
    let checkmate = moveObject.checkmate;
    let stalemate = moveObject.stalemate;
    if (color === "b")
      updateTable(move, FEN, true, board_1, checkmate, stalemate);
    else updateTable(move, FEN, false, board_1, checkmate, stalemate);

    // let engineMoveHandler know that the client has received the engine move, so that it can be deleted from storage
    socket.emit("receivedAMove", clientID);
  });
});

function updateTable(move, fen, black, board_1, checkmate, stalemate) {
  if (!black) {
    // update global move counter variable
    move_counter = move_counter + parseInt($("#TableId").find("tr").length + 1);

    $("#PGNTable").append(
      '<tr id="Move_' +
        move_counter +
        '"><td> ' +
        move_counter +
        " .</td>" +
        '<td id="' +
        ++tabindex +
        ' class="Move" tabindex="' +
        tabindex +
        '" data-FEN="' +
        fen +
        '" >' +
        '<a href="#">' +
        move +
        " </td></tr>"
    );

    // update FEN
    FEN = fen;
    // update board
    board_1.position(FEN);
  } else {
    // find the last tr and append td to it
    var ex = $("#PGNTable").find("tr").last();
    $(ex).append(
      '<td id="' +
        ++tabindex +
        ' class="Move" tabindex="' +
        tabindex +
        '" data-FEN="' +
        fen +
        '" >' +
        '<a href="#">' +
        move +
        "</td>"
    );

    // update FEN
    FEN = fen;
    // update board
    board_1.position(FEN);
  }

  // Scroll the PGN table to the end move
  var scrollBottom = 0;
  scrollBottom = Math.max($("#PGNTable").height() - $("#pgn").height() + 20, 0);

  if (scrollBottom > 0) {
    var height = $("#PGNTable").height();
    $("#pgn").scrollTop(height);
  }

  if (checkmate || stalemate) {
    alert("Game Over");
    // disable move form-input
    $(".form-control").prop("readonly", true);
    // disable play-as-white
    // $("#play_as_white").prop("disabled", true);
    // disable play-as-black
    // $("#play_as_black").prop("disabled", true);
  }
}

//not used
function disableInput() {
  // disable move form-input
  $(".form-control").prop("readonly", true);
}

//not used
function enableInput() {
  // enable move form-input
  $(".form-control").prop("readonly", false);
}
