const { default: axios } = require("axios");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
const config = require("../env.json")[env];

const Request = require("../helpers/request");
const request = new Request();

const Logger = require("../helpers/logger");
const logger = new Logger();

module.exports = class trabalhosController {
  constructor(parser) {
    this.parser = parser;
    this.cache={}
  }

  async getAtividades() {
    try {
      if(!this.cache.getAtividades){
        return this.cache.getAtividades;
      }else{
        const atividades = await request.get(
          "aee_digital_trabalhos",
          `/atividade`
        );
  
        logger.info("getAtividades", atividades);

        this.cache.atividades = atividades;
        return atividades;

      }
    } catch (error) {
      logger.error("trabalhos.controller.getAtividades: Error=>", error);
    }
  }

  async getAtividadesCentroByParams(params) {
    try {
      if(!this.cache.getAtividadesCentroByParams && this.cache.getAtividadesCentroByParams[params]){
        return this.cache.getAtividadesCentroByParams[params];
      }else{
        const atividades = await request.get(
          "aee_digital_trabalhos",
          `/atividade_centro?${params}`
        );
        logger.info("getAtividadesCentroByParams", atividades);

        if(!this.cache.getAtividadesCentroByParams){
          this.cache.getAtividadesCentroByParams = {}
        }
        
        this.cache.getAtividadesCentroByParams[params] = atividades;
        return atividades;
      }
    } catch (error) {
      logger.error("trabalhos.controller.getAtividadesCentroByParams: Error=>", error);
    }
  }

  async getAtividadesCentroSummaryByParams(params) {
    try {
      if(!this.cache.getAtividadesCentroSummaryByParams && this.cache.getAtividadesCentroSummaryByParams[params]){
        return this.cache.getAtividadesCentroSummaryByParams[params];
      }else{
        const atividades = await request.get(
          "aee_digital_trabalhos",
          `/atividade_centro_summary?${params}`
        );

        if(!this.cache.getAtividadesCentroSummaryByParams){
          this.cache.getAtividadesCentroSummaryByParams = {}
        }

        this.cache.getAtividadesCentroSummaryByParams[params] = atividades

        logger.info("getAtividadesCentroSummaryByParams", atividades);
        return atividades;
      }
    } catch (error) {
      logger.error(
        "trabalhos.controller.getAtividadesCentroSummaryByParams: Error=>",
        error
      );
    }
  }

  async getFormByParams(params) {
    try {

      if(!this.cache.getFormByParams ){this.cache.getFormByParams={}}
      
      if(this.cache.getFormByParams[params]){
        return this.cache.getFormByParams[params];
      }else{
        const form = await request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_form?${params}`
        );

        this.cache.getFormByParams[params] = form

        logger.info("getFormByParams", form);
        return form;
      }
    } catch (error) {
      logger.error("trabalhos.controller.getFormByParams: Error=>", error);
    }
  }

  async getQuizTemplateByParams(params) {
    try {
      if(!this.cache.getQuizTemplateByParams ){this.cache.getQuizTemplateByParams={}}
      
      if(this.cache.getQuizTemplateByParams[params]){
        return this.cache.getQuizTemplateByParams[params];
      }else{
        const quiz = await request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_quiz?${params}`
        );

        this.cache.getQuizTemplateByParams[params] = quiz
  
        logger.info("getQuizTemplateByParams", quiz);
        return quiz;

      }
    } catch (error) {
      logger.error(
        "trabalhos.controller.getQuizTemplateByParams: Error=>",
        error
      );
    }
  }

  async getQuestionByParams(params) {
    try {

      if(!this.cache.getQuestionByParams ){this.cache.getQuestionByParams={}}

      if(this.cache.getQuestionByParams[params]){
        return this.cache.getQuestionByParams[params]
      }else{
        const quiz = await request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_question?${params}`
        );
  
        logger.info("getQuestionByParams", quiz);
        return quiz;

      }
    } catch (error) {
      logger.error("trabalhos.controller.getQuestionByParams: Error=>", error);
    }
  }

  async getGroupQuestionByParams(params) {
    try {
      const quiz = await request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_group_question?${params}`
      );

      logger.info("getGroupQuestionByParams", quiz);
      return quiz;
    } catch (error) {
      logger.error("trabalhos.controller.getGroupQuestionByParams: Error=>", error);
    }
  }

  async getQuizResponseByParams(params) {
    try {
      const quiz_response = await request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer?${params}`
      );

      logger.info("getQuizResponseByParams", quiz_response);
      return quiz_response;
    } catch (error) {
      logger.error(
        "trabalhos.controller.getQuizResponseByParams: Error=>",
        error
      );
    }
  }

  async deleteQuizResponseByParams(params) {
    try {
      const quiz_response = await request.delete(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer?${params}`
      );

      logger.info("deleteQuizResponseByParams", quiz_response);
      return quiz_response;
    } catch (error) {
      logger.error(
        "trabalhos.controller.deleteQuizResponseByParams: Error=>",
        error
      );
    }
  }

  async getPasses() {
    try {
      const atividades = await request.get("aee_digital_trabalhos", `/pass`);

      logger.info("getPasses", atividades);
      return atividades;
    } catch (error) {
      logger.error("trabalhos.controller.getPasses: Error=>", error);
    }
  }

  async getSummaries(){
    try {
      const quiz_response = await request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_summary`
      );

      logger.info("getSummaries", quiz_response);
      return quiz_response;
    } catch (error) {
      logger.error("trabalhos.controller.getSummaries: Error=>", error);
    }
  }

  async getPassByParams(params) {
    try {
      const passes = await request.get(
        "aee_digital_trabalhos",
        `/pass?${params}`
      );

      logger.info("getPassByParams", passes);
      return passes;
    } catch (error) {
      logger.error("trabalhos.controller.getPassByParams: Error=>", error);
    }
  }

  async postPass(params) {
    try {
      const pass = await request.post("aee_digital_trabalhos", `/pass`, params);

      logger.info("postPass", pass);
      return pass;
    } catch (error) {
      logger.error("trabalhos.controller.postPass: Error=>", error);
    }
  }

  async putQuizResponse(params, value) {
    try {
      const quiz_response = await request.put(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer?${params}`,
        value
      );

      logger.info("putQuizResponse", quiz_response);
      return quiz_response;
    } catch (error) {
      logger.error(
        "trabalhos.controller.putQuizResponse: Error=>",
        error
      );
    }
  }

  async postQuizResponse(params) {
    try {
      const quiz_response = await request.post(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer`,
        params
      );

      logger.info("postQuizResponse", quiz_response);
      return quiz_response;
    } catch (error) {
      logger.error(
        "trabalhos.controller.postQuizResponse: Error=>",
        error
      );
    }
  }

  async getPessoaByParams(params) {
    try {
      const quiz_response = await request.get(
        "aee_digital_trabalhos",
        `/pessoa?${params}`
      );

      logger.info("getPessoaParams", quiz_response);
      return quiz_response;
    } catch (error) {
      logger.error("trabalhos.controller.getPessoaParams: Error=>", error);
    }
  }

  async getQuizSummaryByParams(params) {
    try {
      const quiz_response = await request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_summary?${params}`
      );

      logger.info("getQuizSummaryByParams", quiz_response);
      return quiz_response;
    } catch (error) {
      logger.error("trabalhos.controller.getQuizSummaryByParams: Error=>", error);
    }
  }
  async postQuizSummary(params) {
    try {
      const quiz_response = await request.post(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_summary`,
        params
      );

      logger.info("postQuizSummary", quiz_response);
      return quiz_response;
    } catch (error) {
      logger.error("trabalhos.controller.postQuizSummary: Error=>", error);
    }
  }

  async putQuizSummary(params, value) {
    try {
      const quiz_response = await request.put(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_summary?${params}`,
        value
      );

      logger.info("putQuizSummary", quiz_response);
      return quiz_response;
    } catch (error) {
      logger.error("trabalhos.controller.putQuizSummary: Error=>", error);
    }
  }

  async checkFormCompletion(formName, centroId){
    let form = await this.getFormByParams(this.parser.getParamsParsed({
      NAME: formName
    }));

    form = form[0];

    for (const page of form.PAGES) {
      for (const quiz of page.QUIZES) {
        for (const groupQuestions of quiz.QUESTIONS) {
          for (const question of groupQuestions.GROUP) {
            if(question.IS_REQUIRED){
                 let response = await this.getQuizResponseByParams(this.parser.getParamsParsed({
                  CENTRO_ID: centroId,
                  QUIZ_ID: quiz._id,
                  QUESTION_ID:question._id
                }));

                if(response.length==0 ){
                  return false
                }else if(response[0].ANSWER == " "){
                  return false;
                }
            }
          }
        }
      }
    }
    return true;
  }
};
