var express = require('express');
var router = express.Router();

const {TryAuthenticate, TryLogout} = require("../helpers/auth.helpers")

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
  