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
const parser = require("./helpers/parser");

const regionalController = require("./controllers/regional.controller");
const regionalcontroller = new regionalController();

const trabalhosController = require("./controllers/trabalhos.controller");
const trabalhoscontroller = new trabalhosController(parser);

const readXlsxFile = require("read-excel-file/node");


const CentroInfoController = require("./controllers/centroInfo.controller");
const centroinfocontroller = new CentroInfoController(
  logger,
  readXlsxFile,
  parser
);
centroinfocontroller.generatePassCache();

const userInfoController = require("./controllers/userInfo.controller");
const userinfocontroller = new userInfoController(
  regionalcontroller,
  centroinfocontroller,
  trabalhoscontroller,
  logger,
  parser
);

const authController = require("./controllers/auth.controller");
const authcontroller = new authController(
  logger,
  readXlsxFile,
  trabalhoscontroller,
  regionalcontroller,
  userinfocontroller,
  parser
);
authcontroller.generatePassCache();

const SearchController = require("./controllers/search.controller");
const searchcontroller = new SearchController(
  regionalcontroller,
  trabalhoscontroller,
  logger,
  parser
);

const QuizActions = require("./helpers/quiz_actions");
const quiz_actions = new QuizActions(
  searchcontroller,
  trabalhoscontroller,
  logger,
  parser
);

// This will hold the users and authToken related to users
const authTokens = {};
const Request = require("./helpers/request");
const { save } = require("./helpers/quiz_actions");
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

const pageByPermission = {
  presidente: function (info) {
    return `/cadastro_alianca?ID=${info.link}&page=0`;
  },
  coord_regional: function (info) {
    return `/summary_coord?ID=${info.link}`;
  },
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
      let info = {
        link: auth.scope_id,
      };
      res.redirect(pageByPermission[auth.groups[0]](info));
    }
  }
}

app.get("/", requireAuth, async function (req, res) {
  const auth = req.session.auth;
  let info = {
    link: auth.scope_id,
  };
  res.redirect(pageByPermission[auth.groups[0]](info));
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

app.get("/cadastro_alianca", requireAuth, async function (req, res) {
  const centro_id = req.query.ID;
  const page = req.query.page || 0;
  const form_alias = "Cadastro de Informações Anual";

  quiz_actions.open(res, { centro_id, form_alias, page });
});

app.get("/summary_coord", requireAuth, async function (req, res) {
  const regional_id = req.query.ID;

  const paramsParsed = parser.getParamsParsed({
    _id: regional_id,
  });
  const regionalInfo = await regionalcontroller.getRegionalByParams(
    paramsParsed
  );

  const centros = await regionalcontroller.getCentrosByRegional(
    regionalInfo.NOME_REGIONAL
  );

  const responses = {}

  for (let index = 0; index < centros.length; index++) {
    const centro = centros[index];

    response = await trabalhoscontroller.getQuizSummaryByParams(parser.getParamsParsed({
      CENTRO_ID: centro.ID
    }))

    if(response.length>0){
      responses[centro.NOME_CENTRO] = response
    }
    
  }

  const coordenador = await trabalhoscontroller.getPessoaByParams(parser.getParamsParsed({
    "_id": regionalInfo.COORDENADOR_ID
  }))

  res.render("pages/summary_coord", {
    regionalInfo: regionalInfo,
    centros: centros,
    responses: responses,
    coordenador: coordenador[0]
  });
});

app.post("/quiz", requireAuth, async function (req, res) {
  let responses = req.body;
  const form_alias = responses.form_alias;
  const centro_id = responses.centro_id;
  const page_index = responses.page;
  const page_redirect = responses.redirect;
  const action = responses.action;

  await quiz_actions[action](res, {
    centro_id,
    form_alias,
    page_index,
    page_redirect,
    responses,
  });
});

app.delete("/remove_answer", requireAuth, async function(req, res){
  const answer = req.originalUrl;
  let paramsFrom =parser.getQueryParamsParsed(answer);

  let paramsParsed = parser.getParamsParsed({
    _id: paramsFrom.answerId,
  });
  let quizResponse = await trabalhoscontroller.deleteQuizResponseByParams(paramsParsed);

  res.json(quizResponse)
})

function getDefaultValue(question){
  return question.PRESET_VALUES.length > 0 ? question.PRESET_VALUES[0] : " ";
}

app.post("/add_answer", requireAuth, async function(req,res){
  const answer = req.originalUrl;
  let paramsFrom =parser.getQueryParamsParsed(answer);

  const paramsParsed = parser.getParamsParsed({
    _id: paramsFrom.groupId
  })
  const groupQuestion = await trabalhoscontroller.getGroupQuestionByParams(paramsParsed);

  const questions = groupQuestion[0].GROUP;
 

  let response = []

  for (let index = 0; index < questions.length; index++) {
    const question = questions[index]
    
    params = {
      "CENTRO_ID": paramsFrom.centroId,
      "QUIZ_ID": paramsFrom.quizId,
      "QUESTION_ID": question._id,
      "ANSWER": getDefaultValue(question)
    }
    quizResponse = await trabalhoscontroller.postQuizResponse(params);
    response.push(quizResponse[0])
  }

  res.json(response);
});

app.put("/update_answer", requireAuth, async function(req,res){
  const answer = req.originalUrl;
  let paramsFrom =parser.getQueryParamsParsed(answer);

  params = {
    "CENTRO_ID": paramsFrom.centroId,
    "QUIZ_ID": paramsFrom.quizId,
    "QUESTION_ID": paramsFrom.questionId,
    "ANSWER": decodeURIComponent(paramsFrom.answer)
  }

  let paramsParsed = parser.getParamsParsed({
    _id: paramsFrom.answerId,
  });
  const quizResponse = await trabalhoscontroller.putQuizResponse(paramsParsed, {
    ANSWER: paramsFrom.answer,
  });
  

  res.json(quizResponse)
})

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
