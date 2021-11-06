const { default: axios } = require("axios");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
const config = require("../env.json")[env];

const Request = require("../helpers/request");
const request = new Request();

module.exports = class trabalhosController {
  constructor() {}

  async getAtividades() {
    try {
      const atividades = await request.get(
        "aee_digital_trabalhos",
        `/atividades`
      );

      return atividades.data;
    } catch (error) {
      console.log("trabalhos.controller.getAtividades: Error=>", error);
    }
  }

  async getAtividadesCentroByParams(params) {
    try {
      const atividades = await request.get(
        "aee_digital_trabalhos",
        `/atividades_centro?${params}`
      );
      return atividades.data;
    } catch (error) {
      console.log("trabalhos.controller.getAtividades: Error=>", error);
    }
  }

  async getAtividadesCentroSummaryByParams(params) {
    try {
      const atividades = await request.get(
        "aee_digital_trabalhos",
        `/atividade_centro_summary?${params}`
      );

      return atividades.data;
    } catch (error) {
      console.log(
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

      return form.data;
    } catch (error) {
      console.log("trabalhos.controller.getFormByParams: Error=>", error);
    }
  }

  async getQuizTemplateByParams(params) {
    try {
      const quiz = await request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz?${params}`
      );

      return quiz.data;
    } catch (error) {
      console.log(
        "trabalhos.controller.getQuizTemplateByParams: Error=>",
        error
      );
    }
  }

  async getQuizResponseByParams(params) {
    try {
      const quiz_response = await request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer?${params}`
      );

      return quiz_response.data;
    } catch (error) {
      console.log(
        "trabalhos.controller.getQuizResponseByParams: Error=>",
        error
      );
    }
  }

  async putQuizResponse(params, value) {
    try {
      const quiz_response = await request.put(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer?${params}`,
        value
      );

      return quiz_response.data;
    } catch (error) {
      console.log(
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

      return quiz_response.data;
    } catch (error) {
      console.log(
        "trabalhos.controller.getQuizResponseByParams: Error=>",
        error
      );
    }
  }
};
