var express = require("express");
var router = express.Router();

const logger = require("../helpers/logger");

const regionalController = require("../controllers/regional.controller");
const regionalcontroller = new regionalController();

const trabalhosController = require("../controllers/trabalhos.controller");
const trabalhoscontroller = new trabalhosController();

const QuizActions = require("../helpers/quiz_actions");
const quiz_actions = new QuizActions();

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
  const { ID, regionalName, start, end, pais } = req.query;
  
  let regionalInfo;

  if (!regionalName) {
    regionalInfo = await regionalcontroller.getRegionalByParams({ _id: ID})
    
  } else {
    regionalInfo = await regionalcontroller.getRegionalByParams({ NOME_REGIONAL: regionalName, PAIS: pais})
  }

  regionalInfo = regionalInfo[0];

  let [centros, coord_quiz, coordenador, autoavaliacao] = await Promise.all([
    await regionalcontroller.getCentroByParam( {REGIONAL: regionalInfo._id} ),
    await trabalhoscontroller.getQuizTemplateByParams( { CATEGORY: "Coordenador", } ),
    await trabalhoscontroller.getPessoaByParams( { _id: regionalInfo.COORDENADOR_ID, } ),
    await trabalhoscontroller.getQuizTemplateByParams( { CATEGORY: "Auto Avaliação", } )
  ]);

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

function sortRegional(regionalA, regionalB){
  if( regionalA.NOME_REGIONAL > regionalB.NOME_REGIONAL)
    {return 1}
  else if(regionalA.NOME_REGIONAL < regionalB.NOME_REGIONAL)
    {return -1}
  else{
    return 
  }
}

router.get("/summary_alianca", requireAuth, async function (req, res) {
  const { start, end } = req.query;
  let regionais = await regionalcontroller.getRegionais();
  regionais = regionais.sort(sortRegional)

  res.render("pages/summary_alianca", { start,end, regionais });
});



router.get("/cadastro_centro", requireAuth, async function (req, res, next) {
  try {
    const { nomeRegional } = req.query;


    let regionais = await regionalcontroller.getRegionais();
    regionais = regionais.sort(sortRegional)
  
    const estados = [ 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO' ];
    
    res.render("pages/cadastro_centro", { nomeRegional, estados, regionais });  
  } catch (error) {
    next(error)
  }
  
});



module.exports = router;
