const express = require("express");
const app = express();

var compression = require("compression");
app.use(compression());

var bodyParser = require("body-parser");

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
  const auth = req.session.auth;
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

module.exports = function () {
  return app;
};
