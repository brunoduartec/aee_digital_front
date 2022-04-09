var express = require('express');
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
  trabalhoscontroller,
  logger,
  parser
);

const userInfoController = require("../controllers/userInfo.controller");
const userinfocontroller = new userInfoController(
  regionalcontroller,
  centroinfocontroller,
  trabalhoscontroller,
  searchcontroller,
  logger,
  parser
);

const QuizActions = require("../helpers/quiz_actions");
const quiz_actions = new QuizActions(
  trabalhoscontroller,
  userinfocontroller,
  regionalcontroller,
  logger,
  parser
);

const {requireAuth} = require("../helpers/auth.helpers")


router.get("/cadastro_alianca", requireAuth, async function (req, res) {
    try {
        const centro_id = req.query.ID;
        const page = req.query.page || 0;
        const form_alias = "Cadastro de Informações Anual";

        quiz_actions.open(req, res, {
            centro_id,
            form_alias,
            page
        });

    } catch (error) {
        logger.error(`Error Loading summary_alianca: ${error}`)
        res.render("pages/notfound")
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
    const {
        ID,
        regionalName
    } = req.query;

    let paramsParsed

    if (!regionalName) {
        paramsParsed = parser.getParamsParsed({
            _id: ID
        });
    } else {
        paramsParsed = parser.getParamsParsed({
            NOME_REGIONAL: regionalName
        });

    }
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

router.get("/summary_alianca", requireAuth, async function (req, res) {
    res.render("pages/summary_alianca", {});
});

module.exports = router