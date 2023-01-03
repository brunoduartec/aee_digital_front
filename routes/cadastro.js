var express = require("express");
var router = express.Router();

const logger = require("../helpers/logger");
const parser = require("../helpers/parser");

const regionalController = require("../controllers/regional.controller");
const regionalcontroller = new regionalController();

const trabalhosController = require("../controllers/trabalhos.controller");
const trabalhoscontroller = new trabalhosController();

const CentroInfoController = require("../controllers/centroInfo.controller");
const centroinfocontroller = new CentroInfoController();

const SearchController = require("../controllers/search.controller");
const searchcontroller = new SearchController(
  regionalcontroller,
  trabalhoscontroller
);

const userInfoController = require("../controllers/userInfo.controller");
const userinfocontroller = new userInfoController(
  regionalcontroller,
  centroinfocontroller,
  trabalhoscontroller,
  searchcontroller
);

const QuizActions = require("../helpers/quiz_actions");
const quiz_actions = new QuizActions(
  trabalhoscontroller,
  userinfocontroller,
  regionalcontroller,
  logger,
  parser
);

const { requireAuth } = require("../helpers/auth.helpers");

router.get("/cadastro_alianca", requireAuth, async function (req, res) {
  try {
    const centro_id = req.query.ID;
    const page = req.query.page || 0;
    const form_alias = "Cadastro de Informações Anual";

    quiz_actions.open(req, res, {
      centro_id,
      form_alias,
      page,
    });
  } catch (error) {
    logger.error(`Error Loading summary_alianca: ${error}`);
    res.render("pages/notfound");
  }
});

router.post("/quiz", async function (req, res) {
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

router.get("/summary_coord", requireAuth, async function (req, res) {
  const { ID, regionalName } = req.query;

  let paramsParsed;

  if (!regionalName) {
    paramsParsed = parser.getParamsParsed({
      _id: ID,
    });
  } else {
    paramsParsed = parser.getParamsParsed({
      NOME_REGIONAL: regionalName,
    });
  }
  const regionalInfo = await regionalcontroller.getRegionalByParams(
    paramsParsed
  );

  const centros = await regionalcontroller.getCentrosByRegional(
    regionalInfo.NOME_REGIONAL
  );

  let coord_quiz = await trabalhoscontroller.getQuizTemplateByParams(
    parser.getParamsParsed({
      CATEGORY: "Coordenador",
    })
  );

  let coordenador = await trabalhoscontroller.getPessoaByParams(
    parser.getParamsParsed({
      _id: regionalInfo.COORDENADOR_ID,
    })
  );

  let autoavaliacao = await trabalhoscontroller.getQuizTemplateByParams(
    parser.getParamsParsed({
      CATEGORY: "Auto Avaliação",
    })
  );

  let autoavaliacaoQuestion = autoavaliacao[0].QUESTIONS[0].GROUP[0];
  let avaliacaoQuestionId = autoavaliacaoQuestion._id;

  const summaries = await trabalhoscontroller.getSummaries();

  coordenador = coordenador[0];

  coordenador = coordenador || {
    NOME: " ",
  };

  res.render("pages/summary_coord", {
    regionalInfo: regionalInfo,
    centros: centros,
    coordenador: coordenador,
    coord_quiz: coord_quiz,
    summaries: summaries,
    avaliacaoQuestionId: avaliacaoQuestionId,
  });
});

async function getCentroCoordResponses(centroId, quizInfo) {
  try {
    const templates = [];
    if (!centroId) {
      return templates;
    }

    if (quizInfo) {
      quizInfo = quizInfo[0];

      let coordresponse = await trabalhoscontroller.getCoordResponsesByCentroId(
        centroId
      );

      for (const question of quizInfo.QUESTIONS[0].GROUP) {
        let response = coordresponse.filter((m) => {
          return m.QUESTION_ID._id == question._id;
        });

        response = response[0];

        if (!response) {
          response = await setQuizResponse(
            centroId,
            quizInfo.ID,
            question._id,
            " "
          );
          if (response) {
            response = response[0];
          }
        }

        if (response) {
          templates.push({
            ANSWER_ID: response.ID,
            ANSWER: response.ANSWER,
            _id: response.QUESTION_ID._id,
            PRESET_VALUES: question.PRESET_VALUES,
          });
        }
      }
    }

    return {
      templates: templates,
    };
  } catch (error) {
    logger.error(`getCentroCoordResponses ${error}`);
    throw error;
  }
}

router.get("/summary_alianca", requireAuth, async function (req, res) {
  const centros = await regionalcontroller.getCentros()
  const summaries = await trabalhoscontroller.getSummaries();
  const coordresponses = await trabalhoscontroller.getCoordResponses()

  const start = req.query.start
  const end = req.query.end

  let startDate, endDate

  const useDate = start && end

  if(useDate){
    startDate = new Date(start)
    endDate = new Date(end)
  }


  let passes = await trabalhoscontroller.getPasses();
  passes = passes.map((p)=>{
    if(p.groups[0].includes("presidente"))
    {
      return {
        scope_id: p.scope_id
      }
    }
    
  })

  const regionaisInfo = {}
  centros.forEach(centro => {
    const regionalName = centro.REGIONAL.NOME_REGIONAL
    
    if (!regionaisInfo[regionalName]) {
      regionaisInfo[regionalName] = {
        centros: [],
        summaries:[],
        started: 0,
        NOME_REGIONAL: regionalName
      }
    }

    const coord_responses = coordresponses.filter((c) => {
      return c.CENTRO_ID == centro.ID;
    })

    const question = coord_responses.find((q) => {
      return q.QUESTION_ID.PRESET_VALUES.includes("Encerrada")
    })

    const encerrada = question?.ANSWER == "Encerrada" || question?.ANSWER == "Desfiliada"

    if(!encerrada){
      regionaisInfo[regionalName].centros.push(centro)
        const hasStarted = passes.find((p) => {
          return p?.scope_id == centro.ID
        })
        if (hasStarted) {
          regionaisInfo[regionalName].started++
        }

        const summary = summaries.find((s) => {
          const centroMatch = s.CENTRO_ID == centro.ID
          const lastModifiedParsed = new Date(s.LASTMODIFIED)
          let dateMatch = true

          if(useDate){
            dateMatch = lastModifiedParsed > startDate && lastModifiedParsed < endDate
          }

          return centroMatch && dateMatch
        })

        if (summary) {
          regionaisInfo[regionalName].summaries.push(summary)
        }
    }

  });


  res.render("pages/summary_alianca", {regionaisInfo, summaries});
});

module.exports = router;
