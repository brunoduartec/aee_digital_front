var express = require("express");
var router = express.Router();

const logger = require("../helpers/logger");
const parser = require("../helpers/parser");

const BFFService = require("../services/bff.service")
const bffservice = new BFFService();

const userInfoController = require("../controllers/userInfo.controller");
const userinfocontroller = new userInfoController(
  regionalcontroller,
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

router.get("/summary_coord", requireAuth, async function (req, res, next) {
 try {
  const { ID, regionalName, start, end } = req.query;
  
  let regionalInfo;

  if (!regionalName) {
    regionalInfo = await bffservice.getRegionalData({ _id: ID})
    
  } else {
    regionalInfo = await bffservice.getRegionalData({ NOME_REGIONAL: regionalName})

  }

  regionalInfo = regionalInfo[0];

  const centros = await bffservice.getCentroData( {"REGIONAL._id": regionalInfo._id} );

  let coord_quiz = await trabalhoscontroller.getQuizTemplateByParams( { CATEGORY: "Coordenador", } );

  let coordenador = await trabalhoscontroller.getPessoaByParams( { _id: regionalInfo.COORDENADOR_ID, } );

  let autoavaliacao = await trabalhoscontroller.getQuizTemplateByParams( { CATEGORY: "Auto Avaliação", } );

  let autoavaliacaoQuestion = autoavaliacao[0].QUESTIONS[0].GROUP[0];
  let avaliacaoQuestionId = autoavaliacaoQuestion._id;

  const summaries = await trabalhoscontroller.getSummaries(start, end);

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
 } catch (error) {
  next();
 }
  
});

router.get("/summary_alianca", requireAuth, async function (req, res) {
  const { start, end } = req.query;
  let regionais = await regionalcontroller.getRegionais();
  res.render("pages/summary_alianca", { start,end, regionais });
});

module.exports = router;
