var express = require("express");
var router = express.Router();
const { v4: uuidv4 } = require('uuid');


const logger = require("../helpers/logger");
const parser = require("../helpers/parser");

const regionalController = require("../controllers/regional.controller");
const regionalcontroller = new regionalController();

const trabalhosController = require("../controllers/trabalhos.controller");
const trabalhoscontroller = new trabalhosController();

const SearchController = require("../controllers/search.controller");
const searchcontroller = new SearchController(
  regionalcontroller,
  trabalhoscontroller
);

const  ExcelExportReportsController = require("../controllers/excelexportresponses.controller");

const excelExporterHelper = require("../helpers/excelexporter.helper");
const excelexporter = new excelExporterHelper();

const excelexporteresponses = new ExcelExportReportsController(
  excelexporter,
  trabalhoscontroller
);

(async () => {
  await excelexporteresponses.init();
  logger.info("Initialized")
})();

const {
  requireAuth
} = require("../helpers/auth.helpers");

router.get("/bff/coord_responses", async function (req, res) {
  const centroId = req.query.centroID;

  try {

    const templates = [];
    if (!centroId) {
      return templates;
    }

    let coord_quiz = await trabalhoscontroller.getQuizTemplateByParams({
      CATEGORY: "Coordenador",
    });

    coord_quiz = coord_quiz[0]

    let coordresponse = await trabalhoscontroller.getQuizResponseByParams({
      CENTRO_ID: centroId,
      QUIZ_ID: coord_quiz._id,
      fields: "QUESTION_ID,_id,ANSWER"
    });

    for (const question of coord_quiz.QUESTIONS[0].GROUP) {
      let response = coordresponse.filter((m) => {
        return m.QUESTION_ID == question._id;
      });

      response = response[0];

      if (!response) {
        response = await setQuizResponse(
          centroId,
          coord_quiz._id,
          question._id,
          " "
        );
        if (response) {
          response = response[0];
        }
      }

      if (response) {
        templates.push({
          ANSWER_ID: response._id,
          ANSWER: response.ANSWER,
          _id: response.QUESTION_ID,
          PRESET_VALUES: question.PRESET_VALUES,
        });
      }
    }

    res.json({
      templates
    });
  } catch (error) {
    logger.error(`get:coord_responses ${centroId}: ${error}`);
    throw error;
  }
});

router.get("/bff/centros", async function (req, res) {
  try {
    const regionalName = req.query.regionalName;

    let centros;
    if (regionalName) {
      centros = await regionalcontroller.getCentroByParam({"REGIONAL.NOME_REGIONAL":regionalName});
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
    let {
      start,
      end
    } = req.query;
    const passes = await trabalhoscontroller.getPasses();
    let responses = await trabalhoscontroller.getSummaries(start, end);
    const centros = await regionalcontroller.getCentros();



    res.json({
      passes: passes,
      responses: responses,
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

    let coord_quiz = await trabalhoscontroller.getQuizTemplateByParams({
      CATEGORY: "Coordenador",
    });

    let coordenador = await trabalhoscontroller.getPessoaByParams({
      _id: regionalInfo.COORDENADOR_ID,
    });

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

    const centros = await regionalcontroller.getCentroByParam({"REGIONAL.NOME_REGIONAL":nomeRegional});

    const centroIDs = centros.map((m) => {
      return m._id;
    });

    let question = await trabalhoscontroller.getQuestionByParams({
      QUESTION: "Situação",
    });

    question = question[0];

    const situacoes = {
      centros: centros,
      summary: [],
      Integradas: [],
      Inscritas: [],
    };
    for (const id of centroIDs) {
      let summary = await trabalhoscontroller.getQuizSummaryByParams({
        CENTRO_ID: id,
      });
      summary = summary[0];

      if (summary) {
        situacoes.summary.push(summary);
      }

      let situacao = await trabalhoscontroller.getQuizResponseByParams({
        CENTRO_ID: id,
        QUESTION_ID: question._id,
        fields: "ANSWER,_id"
      });
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

    const response = await trabalhoscontroller.getQuizSummaryByParams({
      CENTRO_ID: centroID,
    });

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

    const questionAnswers = await trabalhoscontroller.getQuizResponseByParams({
      "QUESTION_ID": questionId,
      fields: "ANSWER,_id,CENTRO_ID"
    });

    const centros = await regionalcontroller.getCentroByParam({"REGIONAL.NOME_REGIONAL":regionalName});
    
    let questionResponses = {};

    for (const centro of centros) {
      questionResponses[centro._id] = questionAnswers.find((m) => {
        return m.CENTRO_ID === centro._id;
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
    const exporting_guid = req.query.guid
    const io = req.io;

    const fileSaved = await excelexporteresponses.exportCentro(centroId, exporting_guid, io);

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
    const exporting_guid = req.query.guid
    const io = req.io;

    const fileSaved = await excelexporteresponses.exportRegional(regionalName, exporting_guid, io);

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
    const exporting_guid = req.query.guid
    const io = req.io;

    const fileSaved = await excelexporteresponses.exportAll(exporting_guid, io);


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

    if (!centroId)
      throw new Error("centroId required")

    let responses = await trabalhoscontroller.initializeCentro(centroId);

    res.json({
      "message": "Adicionados",
      responses
    });
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

    const responses = await trabalhoscontroller.getQuizResponseByParams({
      CENTRO_ID: centroId,
      fields: "ANSWER, QUESTION_ID"
    });

    let questions = await trabalhoscontroller.getQuestionByParams({ IS_REQUIRED: true, fields:"_id, QUESTION" })

    let not_finished = [];

    questions.forEach(question => {
      const hasResponse = responses.find((response)=>{
        return response.QUESTION_ID == question._id && response.ANSWER.trim().length > 0
      })

      if(!hasResponse){
        not_finished.push(question.QUESTION)
      }
      
    });

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

    let quizResponse = await trabalhoscontroller.getQuizResponseByParams({
      "QUESTION_ID": paramsFrom.questionId,
      CENTRO_ID: paramsFrom.centroId
    });

    if (quizResponse.length > 1) {
      const removed = await trabalhoscontroller.deleteQuizResponseByParams({
        _id: paramsFrom.answerId,
        CENTRO_ID: paramsFrom.centroId,
      });
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

    const groupQuestion = await trabalhoscontroller.getGroupQuestionByParams({
      _id: paramsFrom.groupId,
    });

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

    const quizResponse = await trabalhoscontroller.putQuizResponse({
      _id: paramsFrom.answerId,
    }, {
      ANSWER: paramsFrom.answer,
    });

    

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


async function getReportGroups() {
  const form_alias = "Cadastro de Informações Anual";


  let [form, coordinatorQuiz] = await Promise.all([
    await trabalhoscontroller.getFormByParams({ NAME: form_alias }),
    await trabalhoscontroller.getQuizTemplateByParams({ CATEGORY: "Coordenador", })
  ]);

  form = form[0];

  let coordinatorQuizGroup = coordinatorQuiz[0];

  let infoResponses = form.PAGES.flatMap(page => page.QUIZES);

  infoResponses = infoResponses.map(m => {
    return {
      "CATEGORY": m.CATEGORY,
      QUESTIONS: [{ QUESTION: "Nome Curto" }].concat(m.QUESTIONS.flatMap(group => group.GROUP))
    };
  });

  const coordinatorQuestions = coordinatorQuizGroup.QUESTIONS.flatMap(group => group.GROUP);

  infoResponses.push({
    "CATEGORY": coordinatorQuizGroup.CATEGORY,
    QUESTIONS:  [{ QUESTION: "Nome Curto" }].concat(coordinatorQuestions)
  });
  return { infoResponses, form_alias, coordinatorQuestions };
}


router.get("/bff/reports", async(req,res)=>{
  const scope = req.query.scope_id;
  const id = req.query.ID;
  const io = req.io;
  const exporting_guid = req.query.guid
  var { infoResponses, form_alias, coordinatorQuestions } = await getReportGroups();


  io.emit("report_generated",{
    "event":"report_generated",
    exporting_guid,
    infoResponses
  });

  const centroInfoMethod = async function(id){
    const pesquisaInfo = {
      search: {
        id: id,
        name: form_alias,
      },
      option: "Quiz",
    };
    const pesquisa = await searchcontroller.getPesquisaResult(pesquisaInfo);

    return pesquisa;

  }

  const getResponses = async function(search){
    const answers = []
    const templates = search.templates;
    templates.PAGES.forEach((page) => {
      page.QUIZES.forEach((quiz) => {
        quiz.QUESTIONS.forEach((question) => {
          question.GROUP.forEach((group) => {
            const answer = {
              QUESTION_ID: group._id,
              ANSWER: group.ANSWER
            }
            answers.push(answer);
          });
        });
      });
    });

    return answers
  }

  const getCoordenadorResponses = async function(coordinatorQuestions, centroResponses){
    const responses = [];
    for (const question of coordinatorQuestions) 
    {
      let response = centroResponses.find((m) => {
        return m.QUESTION_ID == question._id;
      });

      responses.push({
        QUESTION_ID: question._id,
        ANSWER: [response.ANSWER]
      })

    }
   return responses;
  }


  const createCentroMatrix = async function(infoResponses, centrosResponses, nome_curto){
    let currentRow = 1

    let rowsInfo = []
    
    infoResponses.forEach(header => {

      let rowInfo = {
        CATEGORY: header.CATEGORY,
        row:[]
      }

      const cols = header.QUESTIONS.length
      
      if(!header.matrix){
        //alocando memoria
        header.matrix = new Array(2);
        for(let i = 0; i < 2; i++) {
          header.matrix[i] = new Array(cols);
        }
      }else{
        const rows = header.matrix.length
        header.matrix[rows] = new Array(cols);
        currentRow = rows
      }
  
      header.matrix[currentRow][0] = nome_curto
      header.matrix[0][0] = "Nome Curto"


      for (let col = 1; col < cols; col++) {
        const question = header.QUESTIONS[col]
        
        header.matrix[0][col] = question.QUESTION

        let answer = centrosResponses.filter((m) => {
          return m.QUESTION_ID == question._id
        })[0]

        let questionAnswer = (answer && answer.ANSWER) ? answer.ANSWER.toString() : ""
        header.matrix[currentRow][col] = questionAnswer.replace(/true/g, "sim").replace(/false/g, "não")
      }

      rowInfo.row = header.matrix[currentRow]
      rowsInfo.push(rowInfo)

    });

    io.emit("report_generated",{
      "event":"row_generated",
      exporting_guid,
      rowsInfo
    });
    
  }

  const setCentroInfo = async function(centroId){
    const [itemSearched, centro, centroResponses] = await Promise.all([
      await centroInfoMethod(centroId),
      await regionalcontroller.getCentroByParam({_id: centroId}),
      await trabalhoscontroller.getQuizResponseByParams({CENTRO_ID: centroId})
    ]);

    let centrosResponses  = (await getResponses(itemSearched)).concat( await getCoordenadorResponses(coordinatorQuestions,centroResponses))

    let nome_curto
    if (Array.isArray(centro) && centro.length > 0 && typeof centro[0] === 'object' && 'NOME_CURTO' in centro[0]) {
      nome_curto = centro[0].NOME_CURTO
    }else{
      nome_curto = centroId
    }
  
    await createCentroMatrix(infoResponses, centrosResponses, nome_curto)
   
  }

  const setRegionalInfo =  async function(regionalId){
    let  [regionalInfo] = await regionalcontroller.getRegionalByParams({ _id: regionalId})
    
    const centros = await regionalcontroller.getCentroByParam( {"REGIONAL._id": regionalInfo._id} )
  
    Promise.all(centros.map(centro => setCentroInfo(centro._id))).then(()=>{
      io.emit("end_report_generated",{
        "event":"end_generated",
        exporting_guid
      });
    });
  }


  switch (scope) {
    case "CENTRO":
    setCentroInfo(id).then(()=>{
      io.emit("end_report_generated",{
        "event":"end_generated",
        exporting_guid
      });
    })
      break;

    case "REGIONAL":

     setRegionalInfo(id)
    break;

    case "GERAL":

    break;
  
    default:
      break;
  }

  res.json({status:200, message: "finished"})
  
})

router.get("/reports", async (req, res)=>{
  const scope_id = req.query.scope_id;
  const ID = req.query.ID;
  const guid = uuidv4();

  var { infoResponses } = await getReportGroups();

  res.render("pages/reports",{scope_id,ID,guid, infoResponses})
})


module.exports = router;

