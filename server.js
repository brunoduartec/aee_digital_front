const config = require("./env.json")["local"];
const express = require("express");
const app = express();
var session = require("express-session");
var bodyParser = require("body-parser");

const regionalController = require("./controllers/regional.controller");
const regionalcontroller = new regionalController();

const authController = require("./controllers/auth.controller");
const authcontroller = new authController();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

async function authenticate(req, res, route, params) {
  if (!req.session.loggedin) {
    const loginInfo = {
      user: req.body.email,
      pass: req.body.pass
    };
    if (await authcontroller.authenticate(loginInfo.user, loginInfo.pass)) {
      req.session.loggedin = true;
      console.log("ROTA", route, params);
      res.render(route, params);
    }
    else{
      res.render("pages/login", { auth: false, ...loginInfo });
    }
  }else{
    console.log("ROTA", route, params);
    res.render(route, params);
  }
}

app.get("/", async function (req, res) {
  await authenticate(req,res,'pages/index');
});

app.get("/login", async function (req, res) {
  await authenticate(req,res,'pages/login');
});

app.post("/login", async function (req, res) {
  console.log("POST");
  await authenticate(req,res,'pages/index');
});

app.get("/pesquisar", async function (req, res) {
  let regionals = []
  const opcoes = [
    "Centro",
    "Regional",
    "Trabalho"
  ]
  try {
    regionals = await regionalcontroller.getRegionais();
    
  } catch (error) {
    
  }
  console.log(regionals);

  await authenticate(req,res,'pages/pesquisar',{ regionals: regionals, opcoes: opcoes });
});

app.post("/pesquisa", async function (req, res) {
  let centro = []
  try {
    

    console.log("CENTRO=>", centroInfo, centro)
    
  } catch (error) {
    
  }
  console.log(centro);

  await authenticate(req,res,'pages/pesquisa',{ centro: centro });
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
