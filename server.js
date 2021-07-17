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

async function getPesquisaResult(opcao, search){
  const searchByOpcao = {
    "Centro": async function(){
      const centro = await regionalcontroller.getCentroByParam({NOME_CURTO: search})
      return centro;
    },
    "Trabalho": async function(){
      const trabalho = [{
        "NOME": "teste"
      }]
      return trabalho;
    },
    "Regional": async function(){
      const centros = await regionalcontroller.getCentros()
      return centros;
    }
  }
  return await searchByOpcao[opcao].call();
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
  const opcoes = [
    "Centro",
    "Regional",
    "Trabalho"
  ]

  await authenticate(req,res,'pages/pesquisar',{ opcoes: opcoes });
});

app.post("/pesquisa", async function (req, res) {
  let centro = []
  try {
    const opcao = req.body.opcao
    const search = req.body.search

    console.log("PESQUISAR", opcao, search)

    const result = await getPesquisaResult(opcao,search);

    console.log("RESULT",result)
    await authenticate(req,res,'pages/pesquisa',{ opcao: opcao, result: result });
  } catch (error) {
    
  }
  console.log(centro);

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
