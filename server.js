const config = require("./env.json")["local"];
const express = require("express");
const app = express();
var session = require("express-session");
var bodyParser = require("body-parser");

const regionalController = require("./controllers/regional.controller");
const regionalcontroller = new regionalController();

const trabalhosController = require("./controllers/trabalhos.controller");
const trabalhoscontroller = new trabalhosController();

const authController = require("./controllers/auth.controller");
const authcontroller = new authController();

const SearchController = require("./controllers/search.controller");
const searchcontroller = new SearchController(
  regionalcontroller,
  trabalhoscontroller
);

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

async function TryAuthenticate(req, res, route) {
  const loginInfo = {
    user: req.body.email,
    pass: req.body.pass,
  };

  req.body.route = req.originalUrl;
  if (!req.session.loggedin) {
    const auth = await authcontroller.authenticate(loginInfo);
    if (!auth) {
      res.render("pages/login", { auth: false, ...loginInfo });
      return false;
    } else {
      req.session.loggedin = true;
      return true;
    }
  } else {
    return true;
  }
}

app.get("/", async function (req, res) {
  if (await TryAuthenticate(req, res)) {
    res.render("pages/index");
  }
});

app.get("/centro", async function (req, res) {
  if (await TryAuthenticate(req, res)) {
    const centro = req.query.nome;
    const edit = req.query.edit;
    const option = "Centro";

    const pesquisaInfo = {
      search: centro,
      option: option,
    };
    const result = await searchcontroller.getPesquisaResult(pesquisaInfo);

    if (edit) {
      res.render("pages/editar_centro", { result: result });
    } else {
      res.render("pages/detalhe", {
        opcao: option,
        result: result,
      });
    }
  }
});

app.post("/update_centro", async function (req, res) {
  if (await TryAuthenticate(req, res)) {
    const centroInfo = {
      NOME_CENTRO: req.body.nome,
      NOME_CURTO: req.body.NOME_CURTO,
      CNPJ_CENTRO: req.body.cnpj,
      DATA_FUNDACAO: req.body.fundacao,
      ENDERECO: req.body.endereco,
      CEP: req.body.cep,
      BAIRRO: req.body.bairro,
      CIDADE: req.body.cidade,
      ESTADO: req.body.estado,
      PAIS: req.body.pais,
    };

    res.render("pages/detalhe", {
      opcao: option,
      result: result,
    });
  }
});

app.get("/login", async function (req, res) {
  if (await TryAuthenticate(req, res)) {
    const route = req.body.route;
    res.render("pages/index");
  }
});

app.post("/login", async function (req, res) {
  if (await TryAuthenticate(req, res)) {
    const route = req.body.route;
    // res.redirect(route);
    res.render("pages/index");
  }
});

app.get("/pesquisar", async function (req, res) {
  if (await TryAuthenticate(req, res)) {
    const regionais = await regionalcontroller.getRegionais();
    const atividades = await trabalhoscontroller.getAtividades();

    res.render("pages/pesquisar", {
      regionais: regionais,
      atividades: atividades,
    });
  }
});

app.post("/pesquisa", async function (req, res) {
  if (await TryAuthenticate(req, res)) {
    let centro = [];
    try {
      const regional = req.body.regional;
      const trabalho = req.body.trabalho;
      const search = req.body.search;
      const opcao = "Trabalho";

      const pesquisaInfo = {
        regional: regional,
        trabalho: trabalho,
        search: search,
        option: opcao,
      };
      const result = await searchcontroller.getPesquisaResult(pesquisaInfo);

      if (result) {
        res.render(req, res, "pages/pesquisa", {
          opcao: opcao,
          result: result,
        });
      } else {
        const opcoes = ["Centro", "Regional", "Trabalho"];

        res.render(req, res, "pages/pesquisar", {
          opcoes: opcoes,
          result: null,
        });
      }
    } catch (error) {}
    console.log(centro);
  }
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
