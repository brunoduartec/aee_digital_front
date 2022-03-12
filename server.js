const express = require("express");
const app = express();
var session = require("express-session");
var compression = require('compression')
app.use(compression())


var bodyParser = require("body-parser");

const logger = require("./helpers/logger");
const readXlsxFile = require("read-excel-file/node");

const crypto = require("crypto");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
const config = require("./env.json")[env];
const parser = require("./helpers/parser");

const Request = require("./helpers/request")
const request = new Request(logger);

const regionalController = require("./controllers/regional.controller");
const regionalcontroller = new regionalController(logger, request);
regionalcontroller.generateInfoByCache(readXlsxFile);

const trabalhosController = require("./controllers/trabalhos.controller");
const trabalhoscontroller = new trabalhosController(parser, logger, request);


const CentroInfoController = require("./controllers/centroInfo.controller");

const schema = require("./resources/centro_schema")();
const fileName = `./resources/${config.centros.base}.xlsx`;

const Reader = require("./helpers/reader")
const reader = new Reader(readXlsxFile, fileName, schema)
const centroinfocontroller = new CentroInfoController(
  logger,
  reader,
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
  userinfocontroller,
  regionalcontroller,
  logger,
  parser
);

const excelExporterController = require("./controllers/excelexporter.controller")
const excelexportercontroller = new excelExporterController();

// This will hold the users and authToken related to users
const authTokens = {};
request.addInstance("aee_digital_regionais", config.aee_digital_regionais);
request.addInstance("aee_digital_trabalhos", config.aee_digital_trabalhos);

authcontroller.generatePassCache();
trabalhoscontroller.generateInfoByCache();

app.set("view engine", "ejs");
app.use(express.static("public"));
// app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
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
  coord_geral: function (info) {
    return `/summary_alianca`;
  }
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
    res.render("pages/login", {
      message: {}
    });
  }
};

async function TryLogout(req, res) {
  authTokens[req.session.authToken] = null;
  req.session.authToken = null;
  req.session.auth = null;
  req.session = null;

  res.redirect("/");
}

async function TryAuthenticate(req, res, route) {
  const loginInfo = {
    user: req.body.email,
    pass: req.body.pass,
  };

  let auth = await authcontroller.authenticate(loginInfo);
  if (!auth) {
    res.redirect("/login?failedAuth=true");
  } else {

    let mustInitialize = auth.scope_id == null;

    const userInfo = await userinfocontroller.initializeUserInfo(auth);

    if (mustInitialize) {
      const appendInfo = {
        scope_id: userInfo.scope_id
      }
      const paramsParsed = parser.getParamsParsed({
        user: loginInfo.user,
        pass: loginInfo.pass
      });
      await trabalhoscontroller.updatePass(paramsParsed, appendInfo)
    }

    const authToken = generateAuthToken();
    authTokens[authToken] = loginInfo.user;

    req.session.authToken = authToken;

    req.session.auth = auth;

    let info = {
      link: userInfo.scope_id
    };
    res.redirect(pageByPermission[auth.groups[0]](info));
  }
}

app.get("/", requireAuth, async function (req, res) {
  const auth = req.session.auth;
  let info = {
    link: auth.scope_id,
  };
  res.redirect(pageByPermission[auth.groups[0]](info));
});

app.get("/centros", requireAuth, async function (req, res) {
  const regionalName = req.query.regionalName
  let centros
  let regionals

  if (regionalName != null) {
    centros = await regionalcontroller.getCentroByCacheByRegional(
      regionalName
    );
    regionals = [{
      NOME_REGIONAL: regionalName
    }]
  } else {
    centros = await regionalcontroller.getCentrosByCache();
    regionals = await regionalcontroller.getRegionais();

    regionals = regionals.sort(function (a, b) {
      if (a.NOME_REGIONAL > b.NOME_REGIONAL) {
        return 1;
      }
      if (a.NOME_REGIONAL < b.NOME_REGIONAL) {
        return -1;
      }
    });
  }


  res.render("pages/centros", {
    centros: centros,
    regionais: regionals
  })
})

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

  quiz_actions.open(req, res, {
    centro_id,
    form_alias,
    page
  });
});

async function setQuizResponse(centroID, quizID, questionID, ANSWER) {
  try {
    let answewrInfo = {
      CENTRO_ID: centroID,
      QUIZ_ID: quizID,
      QUESTION_ID: questionID,
      ANSWER: ANSWER,
    };
    response = await trabalhoscontroller.postQuizResponse(answewrInfo);
    response = response[0];

  } catch (error) {
    logger.error(`setQuizResponse ${error}`)
    throw error
  }

}

async function getCentroCoordResponses(centroId, quizInfo) {
  try {
    const templates = []
    if (!centroId) {
      return templates
    }

    if (quizInfo) {
      quizInfo = quizInfo[0]

      let coordresponse = await trabalhoscontroller.getCoordResponsesByCentroId(centroId)

      for (const question of quizInfo.QUESTIONS[0].GROUP) {

        let response = coordresponse.filter(m => {
          return m.QUESTION_ID._id == question._id
        })

        response = response[0]

        if (!response) {
          response = await setQuizResponse(centroId, quizInfo.ID, question._id, " ")
          if (response) {
            response = response[0]
          }
        }

        if (response) {
          templates.push({
            ANSWER_ID: response.ID,
            ANSWER: response.ANSWER,
            _id: response.QUESTION_ID._id,
            PRESET_VALUES: question.PRESET_VALUES
          });
        }


      }
    }

    return {
      templates: templates
    };

  } catch (error) {
    logger.error(`getCentroCoordResponses ${error}`)
    throw error
  }
}

app.get("/bff/get_required", async function (req, res) {
  const centroId = req.query.centroID;

  let not_finished
  const responses = await trabalhoscontroller.getQuizResponseByParams(parser.getParamsParsed({
    CENTRO_ID: centroId,
    'QUESTION_ID.IS_REQUIRED': true
  }))

  if (responses) {
    not_finished = responses.filter(m => {
      return m.ANSWER.trim().length == 0;
    })
  }
  res.json(not_finished)
})

app.get("/summary_coord", requireAuth, async function (req, res) {
  const regionalName = req.query.regionalName;

  const paramsParsed = parser.getParamsParsed({
    NOME_REGIONAL: regionalName
  });
  const regionalInfo = await regionalcontroller.getRegionalByParams(
    paramsParsed
  );

  const centros = await regionalcontroller.getCentroByCacheByRegional(
    regionalInfo.NOME_REGIONAL
  );

  let coord_quiz = await trabalhoscontroller.getQuizTemplateByParams(parser.getParamsParsed({
    CATEGORY: "Coordenador"
  }))

  let coordenador = await trabalhoscontroller.getPessoaByParams(parser.getParamsParsed({
    "_id": regionalInfo.COORDENADOR_ID
  }))

  let autoavaliacao = await trabalhoscontroller.getQuizTemplateByParams(parser.getParamsParsed({
    CATEGORY: "Auto Avaliação"
  }));

  let autoavaliacaoQuestion = autoavaliacao[0].QUESTIONS[0].GROUP[0];
  let avaliacaoQuestionId = autoavaliacaoQuestion._id;

  const summaries = await trabalhoscontroller.getSummaries();

  coordenador = coordenador[0];

  coordenador = coordenador || {
    NOME: " "
  }


  res.render("pages/summary_coord", {
    regionalInfo: regionalInfo,
    centros: centros,
    coordenador: coordenador,
    coord_quiz: coord_quiz,
    summaries: summaries,
    avaliacaoQuestionId: avaliacaoQuestionId
  });
});

app.get("/summary_alianca", requireAuth, async function (req, res) {
  res.render("pages/summary_alianca", {});
});

app.post("/quiz", async function (req, res) {
  let responses = req.body;
  const form_alias = responses.form_alias;
  const centro_id = responses.centro_id;
  const page_index = responses.page;
  const page_redirect = responses.redirect;
  const action = responses.action;

  await quiz_actions[action](req, res, {
    centro_id,
    form_alias,
    page_index,
    page_redirect,
    responses,
  });
});

app.delete("/remove_answer", requireAuth, async function (req, res) {
  const answer = req.originalUrl;
  let paramsFrom = parser.getQueryParamsParsed(answer);

  let paramsParsed = parser.getParamsParsed({
    _id: paramsFrom.answerId,
  });
  let quizResponse = await trabalhoscontroller.deleteQuizResponseByParams(paramsParsed);

  res.json(quizResponse)
})

function getDefaultValue(question) {
  return question.PRESET_VALUES.length > 0 ? question.PRESET_VALUES[0] : " ";
}

app.post("/add_answer", requireAuth, async function (req, res) {
  const answer = req.originalUrl;
  let paramsFrom = parser.getQueryParamsParsed(answer);

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

app.put("/update_answer", requireAuth, async function (req, res) {
  const answer = req.originalUrl;
  let paramsFrom = parser.getQueryParamsParsed(answer);

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

  if (trabalhoscontroller.checkQuestionInCoordQuiz(paramsFrom.questionId)) {
    trabalhoscontroller.updateCoordResponseByCentroId(paramsFrom.questionId, paramsFrom.answerId, paramsFrom.answer)
  }


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
  } catch (error) {
    logger.error(`post:pesquisa: ${centro}`);
    throw error
  }
});


//BFF

app.post("/bff/coord_responses", async function (req, res) {
  try {
    const centroID = req.query.centroID;
    const coord_quiz = req ?.body;
    const coord_responses = await getCentroCoordResponses(centroID, coord_quiz)
    res.json(coord_responses)

  } catch (error) {
    logger.error(`post:coord_responses ${centroID}: ${error}`)
    throw (error)
  }
})

app.get("/bff/centros", async function (req, res) {
  const regionalName = req.query.regionalName;

  let centros;
  if (regionalName) {
    centros = await regionalcontroller.getCentrosByRegional(regionalName)
  } else {
    centros = await regionalcontroller.getCentros();
  }

  res.json(centros);
})

app.get("/bff/regional", async function (req, res) {
  const regionalName = req.query.regionalName;

  let regionaisInfo
  if (regionalName) {
    regionaisInfo = await regionalcontroller.getRegionais();
  } else {
    const paramsParsed = parser.getParamsParsed({
      NOME_REGIONAL: regionalName,
    });
    regionaisInfo = await regionalcontroller.getRegionalByParams(paramsParsed);
  }

  res.json(regionaisInfo)
})

app.get("/bff/generalinfo", async function (req, res) {
  const passes = await trabalhoscontroller.getPasses();
  const responses = await trabalhoscontroller.getSummaries();
  const regionais = await regionalcontroller.getRegionais();
  const centros = await regionalcontroller.getCentrosByCache();

  res.json({
    passes: passes,
    responses: responses,
    regionais: regionais,
    centros: centros
  })

})

app.get("/bff/coord_info", async function (req, res) {

  const regional_id = req.query.ID;

  const paramsParsed = parser.getParamsParsed({
    _id: regional_id,
  });

  const regionalInfo = await regionalcontroller.getRegionalByParams(
    paramsParsed
  );

  let coord_quiz = await trabalhoscontroller.getQuizTemplateByParams(parser.getParamsParsed({
    CATEGORY: "Coordenador"
  }))

  let coordenador = await trabalhoscontroller.getPessoaByParams(parser.getParamsParsed({
    "_id": regionalInfo.COORDENADOR_ID
  }))

  res.json({
    regional: regionalInfo,
    coordenador: coordenador,
    coord_quiz: coord_quiz
  });
});

app.get("/bff/situacao", async function (req, res) {
  const nomeRegional = req.query.regionalName;

  const centros = await regionalcontroller.getCentrosByRegional(nomeRegional)

  const centroIDs = centros.map(m => {
    return m.ID
  })

  let question = await trabalhoscontroller.getQuestionByParams(parser.getParamsParsed({
    QUESTION: "Situação"
  }))

  question = question[0]

  const situacoes = {
    centros: centros,
    summary: [],
    Integradas: [],
    Inscritas: []
  };
  for (const id of centroIDs) {

    summary = await trabalhoscontroller.getQuizSummaryByParams(parser.getParamsParsed({
      CENTRO_ID: id
    }))
    summary = summary[0]

    if (summary) {
      situacoes.summary.push(summary);
    }


    let situacao = await trabalhoscontroller.getQuizResponseByParams(parser.getParamsParsed({
      "CENTRO_ID": id,
      "QUESTION_ID": question.ID
    }));
    situacao = situacao[0]
    if (situacao) {
      if (situacao.ANSWER == " ") {
        situacao.ANSWER = question.PRESET_VALUES[0]
      }


      if (situacao.ANSWER == question.PRESET_VALUES[0])
        situacoes.Integradas.push(situacao)
      else {
        situacoes.Inscritas.push(situacao)
      }
    }
  }



  res.json(situacoes)
});

app.get("/bff/summaries", async function (req, res) {
  response = await trabalhoscontroller.getSummaries()

  res.json(response)
})

app.get("/bff/summary", async function (req, res) {
  const centroID = req.query.centroID;

  response = await trabalhoscontroller.getQuizSummaryByParams(parser.getParamsParsed({
    CENTRO_ID: centroID
  }))

  res.json(response)
})

app.get("/bff/answerbyregional", async function (req, res) {
  const questionId = req.query.questionId
  const regionalName = req.query.regionalName

  const questionAnswers = await trabalhoscontroller.getQuizResponseByParams(parser.getParamsParsed({
    "QUESTION_ID._id": questionId
  }));

  const centros = await regionalcontroller.getCentrosByRegional(regionalName);

  questionResponses = {}

  for (const centro of centros) {
    questionResponses[centro.ID] = questionAnswers.find(m => {
      return m.CENTRO_ID === centro.ID
    })
  }

  res.json(questionResponses)

})

app.get("/bff/exportcentrosummary", async function (req, res) {
  try {
    const centroId = req.query.centroId;
    paramsParsed = parser.getParamsParsed({
      _id: centroId
    })
    centroInfo = await regionalcontroller.getCentroByParam(paramsParsed);

    const timeStamp = new Date().getTime();

    const summary = await trabalhoscontroller.getQuizSummaryByParams(parser.getParamsParsed({
      CENTRO_ID: centroId
    }));


    excelinfo = [{
        "header": "QUESTÃO",
        "key": "question"
      },
      {
        "header": "OBRIGATÓRIO",
        "key": "required"
      },
      {
        "header": "RESPOSTA",
        "key": "answer"
      },
    ]
    let fileSaved = await excelexportercontroller.export(`${centroInfo.NOME_CENTRO}_${timeStamp}`, excelinfo, summary)

    // res.sendFile(fileSaved)
    res.send({
      status: "success",
      message: "file successfully downloaded",
      path: `${fileSaved}`,
    });

  } catch (error) {
    logger.error(`/bff/exportcentrosummary: ${error}`)
    res.json({
      status: 500,
      message: error.message
    })
  }
})


app.get("/bff/initializeuserinfo", async function (req, res) {
  try {
    const centroId = req.query.centroId;

    let centroInfo
    let centro, curto, regional

    let paramsParsed
    if (centroId) {
      paramsParsed = parser.getParamsParsed({
        _id: centroId
      })
    } else {
      paramsParsed = parser.getParamsParsed({
        NOME_CENTRO: req.query.centro,
        NOME_CURTO: req.query.curto,
        "REGIONAL.NOME_REGIONAL": req.query.regionalName
      })
    }

    centroInfo = await regionalcontroller.getCentroByParam(paramsParsed);

    centro = centroInfo.NOME_CENTRO,
      regional = centroInfo.REGIONAL.NOME_REGIONAL,
      curto = centroInfo.NOME_CURTO

    let responses = await trabalhoscontroller.getQuizResponseByParams({
      CENTRO_ID: centroInfo.ID
    });

    if (!responses[0]) {
      const info = {
        centro: centro,
        regional: regional,
        curto: curto
      }

      let response = await userinfocontroller.initializeUserInfo(info, centroInfo)
      res.json(response)
    }

  } catch (error) {
    logger.error(`/bff/initializeuserinfo: ${error}`)
    res.json({
      status: 500,
      response: error.message
    })
  }
})

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