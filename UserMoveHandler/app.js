var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var cors = require("cors");

var indexRouter = require("./routes/index");
// var usersRouter = require("./routes/users");

let { putInQ } = require("./MIDDLEWARE/rabbitMqSender");
// require("./MIDDLEWARE/rabbitMqReceiver");
// const engineMoveHandler_router = require("./routes/engineMoveHandler");

var app = express();

app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use("/engineMoveHandler", engineMoveHandler_router);
app.use("/", indexRouter);
app.use(putInQ);

module.exports = app;
