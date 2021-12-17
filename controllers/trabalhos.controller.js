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
  }

  async getAtividades() {
    try {
      const atividades = await request.get(
        "aee_digital_trabalhos",
        `/atividade`
      );

      logger.info("getAtividades", atividades);
      return atividades;
    } catch (error) {
      logger.error("trabalhos.controller.getAtividades: Error=>", error);
    }
  }

  async getAtividadesCentroByParams(params) {
    try {
      const atividades = await request.get(
        "aee_digital_trabalhos",
        `/atividade_centro?${params}`
      );
      logger.info("getAtividadesCentroByParams", atividades);
      return atividades;
    } catch (error) {
      logger.error("trabalhos.controller.getAtividades: Error=>", error);
    }
  }

  async getAtividadesCentroSummaryByParams(params) {
    try {
      const atividades = await request.get(
        "aee_digital_trabalhos",
        `/atividade_centro_summary?${params}`
      );

      logger.info("getAtividadesCentroSummaryByParams", atividades);
      return atividades;
    } catch (error) {
      logger.error(
        "trabalhos.controller.getAtividadesCentroSummaryByParams: Error=>",
        error
      );
    }
  }

  async getFormByParams(params) {
    try {
      const form = await request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_form?${params}`
      );

      logger.info("getFormByParams", form);
      return form;
    } catch (error) {
      logger.error("trabalhos.controller.getFormByParams: Error=>", error);
    }
  }

  async getQuizTemplateByParams(params) {
    try {
      const quiz = await request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz?${params}`
      );

      logger.info("getQuizTemplateByParams", quiz);
      return quiz;
    } catch (error) {
      logger.error(
        "trabalhos.controller.getQuizTemplateByParams: Error=>",
        error
      );
    }
  }

  async getQuestionByParams(params) {
    try {
      const quiz = await request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_question?${params}`
      );

      logger.info("getQuestionByParams", quiz);
      return quiz;
    } catch (error) {
      logger.error("trabalhos.controller.getQuestionByParams: Error=>", error);
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

  async getPasses() {
    try {
      const atividades = await request.get("aee_digital_trabalhos", `/pass`);

      logger.info("getPasses", atividades);
      return atividades;
    } catch (error) {
      logger.error("trabalhos.controller.getPasses: Error=>", error);
    }
  }

  async getPassByParams(params) {
    try {
      const passes = await request.get(
        "aee_digital_trabalhos",
        `/pass?${params}`
      );

      logger.info("getPasssByParams", passes);
      return passes;
    } catch (error) {
      logger.error("trabalhos.controller.getPasssByParams: Error=>", error);
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
        "trabalhos.controller.getQuizResponseByParams: Error=>",
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
        "trabalhos.controller.getQuizResponseByParams: Error=>",
        error
      );
    }
  }

  async getQuizSummaryByParams(params) {
    try {
      const quiz_response = await request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_summary?${params}`
      );

      logger.info("getQuizSummary", quiz_response);
      return quiz_response;
    } catch (error) {
      logger.error("trabalhos.controller.getQuizSummary: Error=>", error);
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
    const form = await this.getFormByParams(this.parser.getParamsParsed({
      NAME: formName
    }));

    const quiz = form[0].PAGES.map(m=>{return m.QUIZES});
    let quizInline= [];

    for (let index = 0; index < quiz.length; index++) {
      const element = quiz[index];
      quizInline = quizInline.concat(element)
    }

    const quizIds = quizInline.map(m=>{return m._id});

    for (let index = 0; index < quizIds.length; index++) {
      const id = quizIds[index];
      let questions = await this.getQuizResponseByParams(this.parser.getParamsParsed({
        CENTRO_ID: centroId,
        QUIZ_ID: id
      }));

      const anwers = questions.filter(m=>{
        return m.ANSWER == " ";
      });
      
      if(anwers.length > 0)
        return false
    }

    return true;

  }
};
