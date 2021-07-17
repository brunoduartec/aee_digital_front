const config = require("./env.json")["local"];
const express = require("express");
const app = express();
var session = require("express-session");
var bodyParser = require("body-parser");

const regionalController = require("./controllers/regional.controller");
const regionalcontroller = new regionalController();

const authController = require("./controllers/auth.controller");
const authcontroller = new authController();

const SearchController = require("./controllers/search.controller")
const searchcontroller = new SearchController(regionalcontroller);

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

app.get("/", async function (req, res) {
  await authcontroller.authenticate(req,res,'pages/index');
});

app.get("/login", async function (req, res) {
  await authcontroller.authenticate(req,res,'pages/login');
});

app.post("/login", async function (req, res) {
  console.log("POST");
  await authcontroller.authenticate(req,res,'pages/index');
});

app.get("/pesquisar", async function (req, res) {
  const opcoes = [
    "Centro",
    "Regional",
    "Trabalho"
  ]

  await authcontroller.authenticate(req,res,'pages/pesquisar',{ opcoes: opcoes });
});

app.post("/pesquisa", async function (req, res) {
  let centro = []
  try {
    const opcao = req.body.opcao
    const search = req.body.search

    console.log("PESQUISAR", opcao, search)

    const result = await searchcontroller.getPesquisaResult(opcao,search);

    console.log("RESULT",result)
    if(result){
      await authcontroller.authenticate(req,res,'pages/pesquisa',{ opcao: opcao, result: result });
    }
    else{
      const opcoes = [
        "Centro",
        "Regional",
        "Trabalho"
      ]
      await authcontroller.authenticate(req,res,'pages/pesquisar',{ opcoes: opcoes, result: null });
    }
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
