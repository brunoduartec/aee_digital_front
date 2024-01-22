/* eslint-disable no-undef */
const bootstrap = require("./bootstrap");
(async () => {
  await bootstrap.initialize();
})();
const config = require("./helpers/config");
const port = process.env.PORT || config.port;

const http = require("http");

const express = require("express");
const cookieParser = require("cookie-parser")
const app = express();
app.use(cookieParser());

const server_http = http.createServer(app);
server_http.listen(port, "0.0.0.0", function () {
  logger.info(`index:server is running on port: ${port}`);
});

var compression = require("compression");
app.use(compression());

var bodyParser = require("body-parser");

const logger = require("./helpers/logger");

const socketIo = require('socket.io');

const io = socketIo(server_http);

const appIo = io.of("/aee_digital_front")

app.use((req, res, next) => {
  req.io = appIo;
  next();
});

app.set("view engine", "ejs");
app.use(express.static("public"));

const { requireAuth, pageByPermission } = require("./helpers/auth.helpers");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(require("./routes/login"));
app.use(require("./routes/centro"));
app.use(require("./routes/cadastro"));
app.use(require("./routes/centro"));
app.use(require("./routes/bff"));

app.get("/", requireAuth, async function (req, res) {
  const auth = req.user;
  let info = {
    link: auth.scope_id,
  };
  res.redirect(pageByPermission[auth.groups[0]](info));
});

// about page
app.get("/about", function (req, res) {
  res.render("pages/about");
});

app.all("*", function (req, res) {
  res.render("pages/notfound");
});