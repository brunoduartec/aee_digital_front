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
    let sub

    if(sub_params.includes("*")){
      sub=[];
      let index = sub_params.indexOf("*");
      let sub_sub_param = [];
      for (let i = 0; i < index; i++) {
         sub_sub_param.push(sub_params[i]);
      }
      let sub_item = this.parser.getNestedObject(item, sub_sub_param)
      
      if(sub_item){
        for (let i = 0; i < sub_item.length; i++) {
          const it = sub_item[i];
          const subToPush = this.parser.getNestedObject(it,[sub_params[index+1]])
          sub.push(subToPush)
        }
      }
      else{
        sub.push(" ")
      }

      return sub;
    }else{
      sub = this.parser.getNestedObject(item, sub_params)
      return sub;
    }
  }

  async insertAnswers(centroInfo, centro_id) {
    try {
      const params = {
        NAME:"Cadastro de Informações Anual"
      }
      let form = await this.trabalhocontroller.getFormByParams(this.parser.getParamsParsed(params))
      form = form[0];

      let answersToAdd = []
  
      for (let index = 0; index < form.PAGES.length; index++) {
        const page = form.PAGES[index];
        let QUIZES = page.QUIZES;
        for (let j = 0; j < QUIZES.length; j++) {
          const quiz = QUIZES[j];
          let QUESTIONS = quiz.QUESTIONS;
          for (let k = 0; k < QUESTIONS.length; k++) {
            const groupQuestions = QUESTIONS[k];
            let GROUP = groupQuestions.GROUP
            for (let l = 0; l < GROUP.length; l++) {
              const question = GROUP[l];
              
              let match = this.depara.find(m=>{
                return (m.QUIZ == quiz.CATEGORY && m.QUESTION == question.QUESTION)
              });
  
              let answer=" "
              
              if(match){
                answer = this.getInfo(centroInfo, match.FROM) || " ";
              }
  
              let answers = []
              answers = answers.concat(answer);

              if(answers.length == 0){
                answers.push(" ")
              }
  
              for (const answ of answers) {
                let answerInfo = {
                  CENTRO_ID: centro_id,
                  QUIZ_ID: quiz._id,
                  QUESTION_ID: question._id,
                  ANSWER: answ,
                };
                answersToAdd.push(answerInfo)
                
                
              }
            }
          }
          
        }
        
      }

      await this.trabalhocontroller.postQuizResponse(answersToAdd);
      
    } catch (error) {
      this.logger.error(`Insert Answers ${error}`)
      throw error
    }

  }

  async initializeUserInfo(info) {
    try {
      if(info.centro == "*"){
        if(info.regional == "*"){
          info.alianca = true;
        }else{
          const paramsParsed = this.parser.getParamsParsed({
            NOME_REGIONAL: decodeURIComponent(info.regional),
          });
          const regional = await this.regionalcontroller.getRegionalByParams(paramsParsed);
          info.regional_id= regional.ID;
        }
      }else{
        const paramsParsed = this.parser.getParamsParsed({
          NOME_CENTRO: decodeURIComponent(info.centro),
          NOME_CURTO: decodeURIComponent(info.curto),
          "REGIONAL.NOME_REGIONAL": decodeURIComponent(info.regional)
        });
        const centro = await this.regionalcontroller.getCentroByParam(paramsParsed);
        const centroInfo = await this.centroinfocontroller.getCentroInfo(
          decodeURIComponent(centro.REGIONAL.NOME_REGIONAL), decodeURIComponent(centro.NOME_CENTRO)
        );
    
        if(centroInfo && centroInfo.centro){
          await this.insertAnswers(centroInfo.centro, centro.ID);
        }else{
          await this.insertAnswers({}, centro.ID);
        }
    
        info.centro_id = centro.ID;
      }
  
      return info;
      
    } catch (error) {
      this.logger.error(`initializeUserInfo ${error}`)
      throw error
    }
  }
};
