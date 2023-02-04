var express = require('express');
var router = express.Router();
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
  const authToken = req.session.authToken;
  req.user = sessioncontroller.getAuthToken(authToken)

  next();
});


router.get("/login", async function (req, res, next) {
  try {
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
    
  } catch (error) {
    next(error)
  }
});

router.post("/login", async function (req, res, next) {
  try {
    await TryAuthenticate(req, res);
  } catch (error) {
    next(error)
  }
});

router.get("/logout", async function (req, res, next) {
  try {
    await TryLogout(req, res);  
  } catch (error) {
  next(error)
  }
    
  
});

module.exports = router;
  