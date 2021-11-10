const express = require("express");
const app = express();
var session = require("express-session");
// const cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
const puppeteer = require("puppeteer");

const Logger = require("./helpers/logger");
const logger = new Logger();

const crypto = require("crypto");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
const config = require("./env.json")[env];

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

// This will hold the users and authToken related to users
const authTokens = {};
const Request = require("./helpers/request");
const request = new Request();
request.addInstance("aee_digital_regionais", config.aee_digital_regionais);
request.addInstance("aee_digital_trabalhos", config.aee_digital_trabalhos);

app.set("view engine", "ejs");
app.use(express.static("public"));
// app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

const generateAuthToken = () => {
  return crypto.randomBytes(30).toString("hex");
};

app.use((req, res, next) => {
  // Get auth token from the cookies
  const authToken = req.session.authToken;

  // Inject the user to the request
  req.user = authTokens[authToken];

  next();
});

const requireAuth = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    req.session.originalUrl = req.originalUrl;
    res.render("pages/login");
  }
};

async function TryLogout(req, res) {
  authTokens[req.session.authToken] = null;
  req.session.authToken = null;
  req.session.auth = null;
  req.session = null;

  res.redirect("/login");
}

async function TryAuthenticate(req, res, route) {
  const loginInfo = {
    user: req.body.email,
    pass: req.body.pass,
  };

  const auth = await authcontroller.authenticate(loginInfo);
  if (!auth) {
    res.redirect("/login");
  } else {
    const authToken = generateAuthToken();
    authTokens[authToken] = loginInfo.user;

    req.session.authToken = authToken;

    req.session.auth = auth;

    if (req.session.originalUrl) {
      res.redirect(req.session.originalUrl);
    } else {
      res.render("pages/index", {
        info: {
          link: auth.scope_id,
        },
        permissions: auth.permissions,
      });
    }
  }
}

app.get("/", requireAuth, async function (req, res) {
  const auth = req.session.auth;
  res.render("pages/index", {
    info: {
      link: auth.scope_id,
    },
    permissions: auth.permissions,
  });
});

app.get("/pdf", requireAuth, async (req, res) => {
  const url = req.query.target;

  const browser = await puppeteer.launch({
    headless: true,
  });

  const webPage = await browser.newPage();

  await webPage.goto(url, {
    waitUntil: "networkidle0",
  });

  const pdf = await webPage.pdf({
    printBackground: true,
    format: "Letter",
    margin: {
      top: "20px",
      bottom: "40px",
      left: "20px",
      right: "20px",
    },
  });

  await browser.close();

  res.contentType("application/pdf");
  res.send(pdf);
});

app.get("/centro", requireAuth, async function (req, res) {
  const centro = req.query.nome;
  const edit = req.query.edit;
  const option = "Centro";

  const pesquisaInfo = {
    search: centro,
    option: option,
  };
  const result = await searchcontroller.getPesquisaResult(pesquisaInfo);

  if (edit) {
    res.render("pages/editar", {
      opcao: option,
      result: result.items,
    });
  } else {
    res.render("pages/detalhe", {
      opcao: option,
      result: result.items,
    });
  }
});

app.get("/trabalho_centro", requireAuth, async function (req, res) {
  const centro = req.query.nome;
  const edit = req.query.edit;
  const option = "Centro_Summary";

  const pesquisaInfo = {
    centro: centro,
    trabalho: "Todos",
    option: option,
  };
  const result = await searchcontroller.getPesquisaResult(pesquisaInfo);

  if (edit) {
    res.render("pages/editar", {
      opcao: "Trabalhos",
      result: result.items,
    });
  } else {
    res.render("pages/detalhe", {
      opcao: option,
      result: result.items,
    });
  }
});

app.get("/cadastro", requireAuth, async function (req, res) {
  const centro = req.query.nome;
  const edit = req.query.edit;
  const option = "Centro_Summary";

  const pesquisaInfo = {
    centro: centro,
    trabalho: "Todos",
    option: option,
  };
  const result = await searchcontroller.getPesquisaResult(pesquisaInfo);

  if (edit) {
    res.render("pages/editar", {
      opcao: "Trabalhos",
      result: result.items,
    });
  } else {
    res.render("pages/detalhe", {
      opcao: option,
      result: result.items,
    });
  }
});

async function getFormInfo(centro_id, form_alias) {
  let option = "Centro";

  let pesquisaInfo = {
    search: centro_id,
    option: option,
  };

  option = "Quiz";

  pesquisaInfo = {
    search: {
      id: centro_id,
      name: form_alias,
    },
    option: option,
  };
  const result = await searchcontroller.getPesquisaResult(pesquisaInfo);
  return result;
}

app.get("/cadastro_alianca", requireAuth, async function (req, res) {
  const centro_id = req.query.ID;
  const page = req.query.page || 0;
  const form_alias = "Cadastro de Informações Anual";

  const form_info = await getFormInfo(centro_id, form_alias);

  logger.info("get:cadastro_alianca", JSON.stringify(form_info));

  res.render("pages/quiz", {
    index: page,
    form_alias: form_alias,
    centro_id: centro_id,
    results: form_info.templates,
    titles: form_info.titles,
  });
});

app.post("/quiz", requireAuth, async function (req, res) {
  let responses = req.body;
  const form_alias = responses.form_alias;
  const centro_id = responses.centro_id;
  const page_index = responses.page;
  const page_redirect = responses.redirect;
  const action = responses.action;

  if (action == "pdf") {
    let pageToRender = `http://localhost:4200/cadastro_alianca?ID=${centro_id}&page=4`;
    res.redirect(`pdf?target=${pageToRender}`);
  } else {
    const form_info = await getFormInfo(centro_id, form_alias);

    const page = form_info.templates.PAGES[page_index];

    const quizes = page.QUIZES;

    for (let index = 0; index < quizes.length; index++) {
      const quiz = quizes[index];
      const questions = quiz.QUESTIONS;

      for (let j = 0; j < questions.length; j++) {
        const question = questions[j];

        let answer = responses[question._id];
        if (responses[question._id] == "on") answer = "true";

        if (responses[question._id]) {
          if (!question.ANSWER) {
            await trabalhoscontroller.postQuizResponse({
              CENTRO_ID: centro_id,
              QUIZ_ID: quiz._id,
              QUESTION_ID: question._id,
              ANSWER: answer,
            });
          } else if (question.ANSWER != responses[question._id]) {
            let paramsParsed = searchcontroller.getParamsParsed({
              CENTRO_ID: centro_id,
              QUIZ_ID: quiz._id,
              QUESTION_ID: question._id,
            });
            await trabalhoscontroller.putQuizResponse(paramsParsed, {
              ANSWER: answer,
            });
          }
        }
      }
    }

    if (action != 0) {
      let page_to = 0;
      if (action != "begin") {
        page_to = parseInt(page_index, 10) + parseInt(action, 10);
      }
      res.redirect(`${page_redirect}&page=${page_to}`);
    }
  }
});

app.post("/update_centro", requireAuth, async function (req, res) {
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
});

app.get("/login", async function (req, res) {
  res.render("pages/login");
});

app.post("/login", async function (req, res) {
  await TryAuthenticate(req, res);
});

app.get("/logout", async function (req, res) {
  await TryLogout(req, res);
});

app.get("/pesquisar", requireAuth, async function (req, res) {
  const regionais = await regionalcontroller.getRegionais();
  const atividades = await trabalhoscontroller.getAtividades();

  res.render("pages/pesquisar", {
    regionais: regionais,
    atividades: atividades,
  });
});

app.post("/pesquisa", requireAuth, async function (req, res) {
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
      res.render("pages/pesquisa", {
        opcao: opcao,
        result: result,
      });
    } else {
      const opcoes = ["Centro", "Regional", "Trabalho"];

      res.render("pages/pesquisar", {
        opcoes: opcoes,
        result: null,
      });
    }
  } catch (error) {}
  logger.error("post:pesquisa", centro);
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
