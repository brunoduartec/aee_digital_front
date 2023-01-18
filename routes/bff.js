var express = require("express");
var router = express.Router();

const logger = require("../helpers/logger");
const parser = require("../helpers/parser");

const regionalController = require("../controllers/regional.controller");
const regionalcontroller = new regionalController();

const trabalhosController = require("../controllers/trabalhos.controller");
const trabalhoscontroller = new trabalhosController();

const ExcelExportResponses = require("../controllers/excelexportresponses.controller");
const excelExporterController = require("../controllers/excelexporter.controller");
const excelexportercontroller = new excelExporterController();

const ReportInfo = require("../controllers/reportinfo.controller");
const reportinfo = new ReportInfo(
  excelexportercontroller,
  trabalhoscontroller,
  regionalcontroller
);

const excelexporteresponses = new ExcelExportResponses(
  excelexportercontroller,
  reportinfo,
  trabalhoscontroller
);

(async () => {
  await reportinfo.repeatedRefresh();
  await excelexporteresponses.init();
  console.log("INITED");
})();

const { requireAuth } = require("../helpers/auth.helpers");

router.post("/bff/coord_responses", async function (req, res) {
  const centroId = req.query.centroID;
  let coord_quiz = req ? req.body : null;
  try {

    const templates = [];
    if (!centroId) {
      return templates;
    }

    if (coord_quiz) {
      coord_quiz = coord_quiz[0];

      let coordresponse = await trabalhoscontroller.getCoordResponsesByCentroId(
        centroId
      );

      for (const question of coord_quiz.QUESTIONS[0].GROUP) {
        let response = coordresponse.filter((m) => {
          return m.QUESTION_ID._id == question._id;
        });

        response = response[0];

        if (!response) {
          response = await setQuizResponse(
            centroId,
            coord_quiz.ID,
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

    res.json ({ templates });
  } catch (error) {
    logger.error(`post:coord_responses ${centroId}: ${error}`);
    throw error;
  }
});

router.get("/bff/centros", async function (req, res) {
  try {
    const regionalName = req.query.regionalName;

    let centros;
    if (regionalName) {
      centros = await regionalcontroller.getCentrosByRegional(regionalName);
    } else {
      centros = await regionalcontroller.getCentros();
    }

    res.json(centros);
  } catch (error) {
    this.logger.error(`/bff/centros: ${error}`);
    throw error;
  }
});

router.get("/bff/regional", async function (req, res) {
  try {
    const regionalName = req.query.regionalName;

    let regionaisInfo;
    if (regionalName) {
      regionaisInfo = await regionalcontroller.getRegionais();
    } else {
      const paramsParsed = parser.getParamsParsed({
        NOME_REGIONAL: regionalName,
      });
      regionaisInfo = await regionalcontroller.getRegionalByParams(
        paramsParsed
      );
    }

    res.json(regionaisInfo);
  } catch (error) {
    this.logger.error(`/bff/regional: ${error}`);
    throw error;
  }
});

router.get("/bff/generalinfo", async function (req, res) {
  try {
    let { start,end } = req.query;
    const passes = await trabalhoscontroller.getPasses();
    let responses = await trabalhoscontroller.getSummaries({removeFields:["ANSWERS"]});
    const regionais = await regionalcontroller.getRegionais();
    const centros = await regionalcontroller.getCentrosByCache();

    if(start){
      let startDateParts = start.split("/")
      
      let endDateParts
      let endDate
      let startDate = new Date(startDateParts[2],startDateParts[1] -1,startDateParts[0])
      
      if(end){
        endDateParts = end.split("/")
        endDate = new Date(endDateParts[2],endDateParts[1] -1,endDateParts[0])
      }
      else{
        end = Date.now()
      }
      
      responses = responses.filter((response)=>{
        const responseDate = new Date(response.LASTMODIFIED)

        return responseDate >= startDate && responseDate <= endDate

      })
    }

    res.json({
      passes: passes,
      responses: responses,
      regionais: regionais,
      centros: centros,
    });
  } catch (error) {
    this.logger.error(`/bff/generalinfo: ${error}`);
    throw error;
  }
});

router.get("/bff/coord_info", async function (req, res) {
  try {
    const regional_id = req.query.ID;

    const paramsParsed = parser.getParamsParsed({
      _id: regional_id,
    });

    const regionalInfo = await regionalcontroller.getRegionalByParams(
      paramsParsed
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

    res.json({
      regional: regionalInfo,
      coordenador: coordenador,
      coord_quiz: coord_quiz,
    });
  } catch (error) {
    this.logger.error(`/bff/coord_info: ${error}`);
    throw error;
  }
});

router.get("/bff/situacao", async function (req, res) {
  try {
    const nomeRegional = req.query.regionalName;

    const centros = await regionalcontroller.getCentrosByRegional(nomeRegional);

    const centroIDs = centros.map((m) => {
      return m.ID;
    });

    let question = await trabalhoscontroller.getQuestionByParams(
      parser.getParamsParsed({
        QUESTION: "Situação",
      })
    );

    question = question[0];

    const situacoes = {
      centros: centros,
      summary: [],
      Integradas: [],
      Inscritas: [],
    };
    for (const id of centroIDs) {
      let summary = await trabalhoscontroller.getQuizSummaryByParams(
        parser.getParamsParsed({
          CENTRO_ID: id,
        })
      );
      summary = summary[0];

      if (summary) {
        situacoes.summary.push(summary);
      }

      let situacao = await trabalhoscontroller.getQuizResponseByParams(
        parser.getParamsParsed({
          CENTRO_ID: id,
          QUESTION_ID: question.ID,
          fields: "ANSWER,_id"
        })
      );
      situacao = situacao[0];
      if (situacao) {
        if (situacao.ANSWER == " ") {
          situacao.ANSWER = question.PRESET_VALUES[0];
        }

        if (situacao.ANSWER == question.PRESET_VALUES[0])
          situacoes.Integradas.push(situacao);
        else {
          situacoes.Inscritas.push(situacao);
        }
      }
    }

    res.json(situacoes);
  } catch (error) {
    this.logger.error(`/bff/situacao: ${error}`);
    throw error;
  }
});

router.get("/bff/summaries", async function (req, res) {
  try {
    const response = await trabalhoscontroller.getSummaries();
    res.json(response);
  } catch (error) {
    this.logger.error(`/bff/summaries: ${error}`);
    throw error;
  }
});

router.get("/bff/summary", async function (req, res) {
  try {
    const centroID = req.query.centroID;

    const response = await trabalhoscontroller.getQuizSummaryByParams(
      parser.getParamsParsed({
        CENTRO_ID: centroID,
      })
    );

    res.json(response);
  } catch (error) {
    this.logger.error(`/bff/summary: ${error}`);
    throw error;
  }
});

router.get("/bff/answerbyregional", async function (req, res) {
  try {
    const questionId = req.query.questionId;
    const regionalName = req.query.regionalName;

    const questionAnswers = await trabalhoscontroller.getQuizResponseByParams(
      parser.getParamsParsed({
        "QUESTION_ID._id": questionId,
        fields:"ANSWER,_id"
      })
    );

    const centros = await regionalcontroller.getCentrosByRegional(regionalName);

    let questionResponses = {};

    for (const centro of centros) {
      questionResponses[centro.ID] = questionAnswers.find((m) => {
        return m.CENTRO_ID === centro.ID;
      });
    }

    res.json(questionResponses);
  } catch (error) {
    this.logger.error(`/bff/answerbyregional: ${error}`);
    throw error;
  }
});

router.get("/bff/exportcentroresponses", async function (req, res) {
  try {
    const centroId = req.query.centroId;

    const fileSaved = await excelexporteresponses.exportCentro(centroId);

    res.send({
      status: "success",
      message: "file successfully downloaded",
      fileName: `${fileSaved}`,
    });
  } catch (error) {
    logger.error(`/bff/exportcentroresponses: ${error}`);
    res.json({
      status: 500,
      message: error.message,
    });
  }
});

router.get("/bff/exportregionalresponses", async function (req, res) {
  try {
    const regionalName = req.query.regionalName;

    const fileSaved = await excelexporteresponses.exportRegional(regionalName);

    res.send({
      status: "success",
      message: "file successfully downloaded",
      fileName: `${fileSaved}`,
    });
  } catch (error) {
    logger.error(`/bff/exportregionalresponses: ${error}`);
    res.json({
      status: 500,
      message: error.message,
    });
  }
});

router.get("/bff/exportrgeneralresponses", async function (req, res) {
  try {
    const fileSaved = await excelexporteresponses.exportAll();

    res.send({
      status: "success",
      message: "file successfully downloaded",
      fileName: `${fileSaved}`,
    });
  } catch (error) {
    logger.error(`/bff/exportrgeneralresponses: ${error}`);
    res.json({
      status: 500,
      message: error.message,
    });
  }
});

router.post("/bff/initialize_centro", async function (req, res) {
  try {
    const centroId = req.query.centroId;

    if(!centroId)
    throw new Error("centroId required")

    let responses = await trabalhoscontroller.getQuizResponseByParams({
      CENTRO_ID: centroId,
    });

    
    if (responses.length == 0) {
      const cadastroFormName = "Cadastro de Informações Anual";
  
      let questionsPage = await trabalhoscontroller.getFormQuestions(
        cadastroFormName
      );

     const answersAdded = await trabalhoscontroller.initializeAnswers(centroId, questionsPage)

      res.json({
        "message": "Adicionados",
        responses: answersAdded
      });
    }
  } catch (error) {
    logger.error(`/bff/initialize_centro: ${error}`);
    res.json({
      status: 401,
      response: error.message,
    });
  }
});

router.get("/bff/get_required", async function (req, res) {
  try {
    const centroId = req.query.centroID;

    let not_finished;
    const responses = await trabalhoscontroller.getQuizResponseByParams(
      parser.getParamsParsed({
        CENTRO_ID: centroId,
        "QUESTION_ID.IS_REQUIRED": true,
        fields:"ANSWER,CENTRO_ID"
      })
    );

    if (responses) {
      not_finished = responses.filter((m) => {
        return m.ANSWER.trim().length == 0;
      });
    }
    res.json(not_finished);
  } catch (error) {
    this.logger.error(`/bff/get_required: ${error}`);
    throw error;
  }
});

router.delete("/bff/remove_answer", requireAuth, async function (req, res) {
  try {
    const answer = req.originalUrl;
    let paramsFrom = parser.getQueryParamsParsed(answer);
    let removedItem = 0

    let paramsParsed = parser.getParamsParsed({
      "QUESTION_ID._id": paramsFrom.questionId,
      CENTRO_ID: paramsFrom.centroId
    })

    let quizResponse = await trabalhoscontroller.getQuizResponseByParams(
      paramsParsed
    );

    if(quizResponse.length>1){
      paramsParsed = parser.getParamsParsed({
        _id: paramsFrom.answerId,
        CENTRO_ID: paramsFrom.centroId,
      });
  
  
      const removed = await trabalhoscontroller.deleteQuizResponseByParams(
        paramsParsed
      );
      removedItem = removed.deletedCount;
    }

    res.json({
      removedItems: removedItem
    });
  } catch (error) {
    this.logger.error(`/bff/remove_answer: ${error}`);
    throw error;
  }
});

function getDefaultValue(question) {
  return question.PRESET_VALUES.length > 0 ? question.PRESET_VALUES[0] : " ";
}

router.post("/bff/add_answer", requireAuth, async function (req, res) {
  try {
    const answer = req.originalUrl;
    let paramsFrom = parser.getQueryParamsParsed(answer);

    const paramsParsed = parser.getParamsParsed({
      _id: paramsFrom.groupId,
    });
    const groupQuestion = await trabalhoscontroller.getGroupQuestionByParams(
      paramsParsed
    );

    const questions = groupQuestion[0].GROUP;

    let response = [];

    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];

      const params = {
        CENTRO_ID: paramsFrom.centroId,
        QUIZ_ID: paramsFrom.quizId,
        QUESTION_ID: question._id,
        ANSWER: getDefaultValue(question),
      };
      const quizResponse = await trabalhoscontroller.postQuizResponse(params);
      response.push(quizResponse[0]);
    }

    res.json(response);
  } catch (error) {
    this.logger.error(`/bff/add_answer: ${error}`);
    throw error;
  }
});

router.put("/bff/update_answer", requireAuth, async function (req, res) {
  try {
    const answer = req.originalUrl;
    let paramsFrom = parser.getQueryParamsParsed(answer);

    let paramsParsed = parser.getParamsParsed({
      _id: paramsFrom.answerId,
    });
    const quizResponse = await trabalhoscontroller.putQuizResponse(
      paramsParsed,
      {
        ANSWER: paramsFrom.answer,
      }
    );

    if (trabalhoscontroller.checkQuestionInCoordQuiz(paramsFrom.questionId)) {
      trabalhoscontroller.updateCoordResponseByCentroId(
        paramsFrom.questionId,
        paramsFrom.answerId,
        paramsFrom.answer
      );
    }

    res.json(quizResponse);
  } catch (error) {
    this.logger.error(`/bff/update_answer: ${error}`);
    throw error;
  }
});

async function setQuizResponse(centroID, quizID, questionID, ANSWER) {
  try {
    let answewrInfo = {
      CENTRO_ID: centroID,
      QUIZ_ID: quizID,
      QUESTION_ID: questionID,
      ANSWER: ANSWER,
    };
    let response = await trabalhoscontroller.postQuizResponse(answewrInfo);
    response = response[0];
    return response;
  } catch (error) {
    logger.error(`setQuizResponse ${error}`);
    throw error;
  }
}

module.exports = router;
