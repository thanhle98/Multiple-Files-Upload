let express = require("express"),
  mongoose = require("mongoose"),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  dbConfig = require("./database/db");
const { typesDef, getUniqueID, sendMessage } = require("./helper");
const api = require("../backend/routes/user.routes");
// MongoDB Configuration
mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    () => {
      console.log("Database sucessfully connected");
    },
    (error) => {
      console.log("Database could not be connected: " + error);
    }
  );

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cors());

app.use("/public", express.static("public"));

app.use("/api", api);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log("Connected to port " + port);
});

app.use((req, res, next) => {
  // Error goes via `next()` method
  setImmediate(() => {
    next(new Error("Something went wrong"));
  });
});

app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});

//////////////////////////////////////////////////
global.clients = {};
global.files_queue = [];
const webSocketsServerPort = 8000;
const webSocketServer = require("websocket").server;
const http = require("http");
// Spinning the http server and the websocket server.
const server = http.createServer();
server.listen(webSocketsServerPort, () => {
  console.log(`Websocket is listening at port ${webSocketsServerPort}`);
});

const wsServer = new webSocketServer({
  httpServer: server,
});

wsServer.on("request", function (request) {
  var userID = getUniqueID();
  const connection = request.accept(null, request.origin);

  global.clients[userID] = connection;
  console.log(
    `Connected: ${userID} in room [${Object.getOwnPropertyNames(global.clients)}]`
  );

  const new_user_json = {
    type: typesDef.USER_JOIN,
    data: userID,
  };

  sendMessage(JSON.stringify(new_user_json));
  connection.on("message", function (message) {
    if (message.type === "utf8") {
      const dataFromClient = JSON.parse(message.utf8Data);
      const json = { type: dataFromClient.type, files_queue: global.files_queue };

      sendMessage(JSON.stringify(json));
    }
  });

  // user disconnected
  connection.on("close", function (connection) {
    console.log(new Date() + " Peer " + userID + " disconnected.");
    delete global.clients[userID];
    sendMessage(JSON.stringify({ type: typesDef.USER_LEAVE, data: userID }));
  });
});
