var express = require('express');
var router = express.Router();

const logger = require("../helpers/logger");

var session = require("express-session");

const sessionController = require("../controllers/session.controller")
const sessioncontroller = new sessionController();

const {TryAuthenticate, TryLogout} = require("../helpers/auth.helpers")

router.use(
    session({
      secret: "secret",
      resave: true,
      saveUninitialized: true,
    })
  );


router.use((req, res, next) => {
  // Get auth token from the cookies
  const authToken = req.session.authToken;

  // Inject the user to the request
  req.user = sessioncontroller.getAuthToken(authToken)

  next();
});


router.get("/login", async function (req, res) {
  const failedAuth = req.query.failedAuth;
  let error
  if (failedAuth) {
    error = "Usuário ou senha incorretos. Favor tentar novamente"
  }
  res.render("pages/login", {
    message: {
      error: error
    }
  });
});

router.post("/login", async function (req, res) {
  await TryAuthenticate(req, res);
});

router.get("/logout", async function (req, res) {
  await TryLogout(req, res);
});

module.exports = router;
  