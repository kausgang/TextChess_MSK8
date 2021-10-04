function hideBoards() {
  $("#board1").hide();
  $("#board2").hide();
  $("#play_as_white").hide();
}

function showHideBoard() {
  // toggle show-hide board
  $("#show-hide_button").on("click", () => {
    if ($("#show-hide_button").attr("board") === "board on") {
      $("#board1").show();
      $("#board2").hide();
      $("#show-hide_button").text("Hide Board");
      $("#empty_board").hide();
      $("#show-hide_button").attr("board", "board off");
    } else {
      $("#board2").hide();
      $("#board1").hide();
      $("#show-hide_button").text("Show Board");
      $("#empty_board").show();
      $("#show-hide_button").attr("board", "board on");
    }
  });
}

function showHideEmptyBoard() {
  $("#empty_board").on("click", () => {
    if ($("#empty_board").attr("board") === "board on") {
      $("#board1").hide();
      $("#board2").show();
      $("#empty_board").text("Hide Board");
      $("#show-hide_button").hide();
      $("#empty_board").attr("board", "board off");
    } else {
      $("#board1").hide();
      $("#board2").hide();
      $("#empty_board").text("Empty Board");
      $("#show-hide_button").show();
      $("#empty_board").attr("board", "board on");
    }
  });
}

function goToMove(board1) {
  // load the board position if move is clicked
  $("#PGNTable").on("click", "td", function (event) {
    var move_fen = $(this).data().fen;
    board1.position(move_fen);

    // also load the copy FEN button with the move FEN
    $("#copy_fen").attr("data-clipboard-text", move_fen);
  });
}

//************************************************************************************************
// https://stackoverflow.com/questions/22817451/use-arrow-keys-to-navigate-an-html-table
function arrowNavigate(board_1) {
  var start = document.getElementById("start");
  start.focus();
  start.style.backgroundColor = "#d5e0d8";
  start.style.color = "black";

  document.onkeydown = checkKey;

  function dotheneedful(sibling) {
    if (sibling != null) {
      start.focus();
      start.style.backgroundColor = "";
      start.style.color = "";
      sibling.focus();
      sibling.style.backgroundColor = "#d5e0d8";
      sibling.style.color = "black";

      // load board position if move is in focus
      let data = $(sibling).data().fen;
      board_1.position(data);

      start = sibling;
    }
  }

  function checkKey(e) {
    e = e || window.event;
    if (e.keyCode == "38") {
      // up arrow
      var idx = start.cellIndex;
      var nextrow = start.parentElement.previousElementSibling;
      if (nextrow != null) {
        var sibling = nextrow.cells[idx];
        dotheneedful(sibling);
      }
    } else if (e.keyCode == "40") {
      // down arrow
      var idx = start.cellIndex;
      var nextrow = start.parentElement.nextElementSibling;
      if (nextrow != null) {
        var sibling = nextrow.cells[idx];
        dotheneedful(sibling);
      }
    } else if (e.keyCode == "37") {
      // left arrow
      var sibling = start.previousElementSibling;

      if (sibling.cellIndex < 1) {
        // var idx = start.cellIndex;
        idx = 2;
        // console.log(idx);
        var nextrow = start.parentElement.previousElementSibling;
        if (nextrow != null) {
          var sibling = nextrow.cells[idx];
          dotheneedful(sibling);
        }
      } else {
        dotheneedful(sibling);
      }

      // dotheneedful(sibling);
    } else if (e.keyCode == "39") {
      // right arrow

      var sibling = start.nextElementSibling;

      if (sibling == null) {
        // var idx = start.cellIndex;
        // don't go to the move number column...go to the move instead
        idx = 1;
        // console.log(idx);
        var nextrow = start.parentElement.nextElementSibling;
        if (nextrow != null) {
          var sibling = nextrow.cells[idx];
          dotheneedful(sibling);
        }
      } else {
        dotheneedful(sibling);
      }

      // dotheneedful(sibling);
    }
  }
}

//***********************************************************************************

// export PGN
function exportPgn() {
  let header = "",
    date = new Date().toLocaleString();

  // build header info
  if (!isUserBlack) header = `[White "User"][Black "Engine"] [Date "${date}"] `;
  else header = `[White "Engine"][Black "User"] [Date "${date}"] `;

  let pgn = "";

  $("td").each(function () {
    var tableValue = $(this).text();
    pgn = pgn + tableValue + " ";
  });

  // console.log(pgn);

  $("#export_pgn").attr("data-clipboard-text", header + pgn);
  new ClipboardJS("#export_pgn");
  alert("PGN copied to clipboard");
}
