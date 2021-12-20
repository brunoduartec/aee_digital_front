module.exports = class UserInfoController {
  constructor(
    regionalcontroller,
    centroinfocontroller,
    trabalhocontroller,
    logger,
    parser
  ) {
    this.regionalcontroller = regionalcontroller;
    this.centroinfocontroller = centroinfocontroller;
    this.trabalhocontroller = trabalhocontroller;

    this.depara = require("../resources/de-para.json");

    this.quiz_cache = [];

    this.logger = logger;
    this.parser = parser;
  }

  getInfo(item, param) {
    let sub_params = param.split(".");
    if (sub_params.length > 1) {
      if (item[sub_params[0]]) {
        return item[sub_params[0]][sub_params[1]];
      } else return;
    } else {
      return item[param];
    }
  }

  async insertAnswers(centroInfo, centro_id) {
    const params = {
      NAME:"Cadastro de Informações Anual"
    }
    let form = await this.trabalhocontroller.getFormByParams(this.parser.getParamsParsed(params))
    form = form[0];

    for (let index = 0; index < form.PAGES.length; index++) {
      const page = form.PAGES[index];
      let QUIZES = page.QUIZES;
      for (let j = 0; j < QUIZES.length; j++) {
        const quiz = QUIZES[j];
        let QUESTIONS = quiz.QUESTIONS;
        for (let k = 0; k < QUESTIONS.length; k++) {
          const question = QUESTIONS[k];
          let GROUP = question.GROUP
          for (let l = 0; l < GROUP.length; l++) {
            const group = GROUP[l];
            
            let match = this.depara.find(m=>{
              return (m.QUIZ == quiz.CATEGORY && m.QUESTION == group.QUESTION)
            });

            let answer=" "
            
            if(match){
              answer = this.getInfo(centroInfo, match.FROM);
            }

            let answewrInfo = {
              CENTRO_ID: centro_id,
              QUIZ_ID: quiz._id,
              QUESTION_ID: group._id,
              ANSWER: answer,
            };
              await this.trabalhocontroller.postQuizResponse(answewrInfo);
          }
        }
        
      }
      
    }

  }

  async initializeUserInfo(info) {
    const paramsParsed = this.parser.getParamsParsed({
      NOME_CENTRO: decodeURIComponent(info.centro),
    });
    const centro = await this.regionalcontroller.getCentroByParam(paramsParsed);
    const centroInfo = await this.centroinfocontroller.getCentroInfo(
      decodeURIComponent(centro.REGIONAL.NOME_REGIONAL), decodeURIComponent(centro.NOME_CENTRO)
    );

    await this.insertAnswers(centroInfo.centro, centro.ID);

    info.centro_id = centro.ID;

    info.initialized = true;

    return info;
  }
};
