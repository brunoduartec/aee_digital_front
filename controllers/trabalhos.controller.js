const { default: axios } = require("axios");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
const config = require("../env.json")[env];

module.exports = class trabalhosController {
  constructor() {}

  async getAtividades() {
    try {
      const atividades = await axios.get(
        `${config.aee_digital_trabalhos}/atividade`
      );
      console.log(
        "trabalhos.controller.getAtividades: Success=>",
        atividades.data
      );
      return atividades.data;
    } catch (error) {
      console.log("trabalhos.controller.getAtividades: Error=>", error);
    }
  }

  async getAtividadesCentroByParams(params) {
    try {
      const atividades = await axios.get(
        `${config.aee_digital_trabalhos}/atividade_centro?${params}`
      );
      console.log(
        "trabalhos.controller.getAtividades: Success=>",
        atividades.data
      );
      return atividades.data;
    } catch (error) {
      console.log("trabalhos.controller.getAtividades: Error=>", error);
    }
  }

  async getAtividadesCentroSummaryByParams(params) {
    try {
      const atividades = await axios.get(
        `${config.aee_digital_trabalhos}/atividade_centro_summary?${params}`
      );
      console.log(
        "trabalhos.controller.getAtividadesCentroSummaryByParams: Success=>",
        atividades.data
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
      const form = await axios.get(
        `${config.aee_digital_trabalhos}/atividade_generic_form?${params}`
      );
      console.log("trabalhos.controller.getFormByParams: Success=>", form.data);
      return form.data;
    } catch (error) {
      console.log("trabalhos.controller.getFormByParams: Error=>", error);
    }
  }

  async getQuizTemplateByParams(params) {
    try {
      const quiz = await axios.get(
        `${config.aee_digital_trabalhos}/atividade_generic_quiz?${params}`
      );
      console.log(
        "trabalhos.controller.getQuizTemplateByParams: Success=>",
        quiz.data
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
      const quiz_response = await axios.get(
        `${config.aee_digital_trabalhos}/atividade_generic_quiz_answer?${params}`
      );
      console.log(
        "trabalhos.controller.getQuizResponseByParams: Success=>",
        quiz_response.data
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
    console.log(params);

    try {
      const quiz_response = await axios.put(
        `${config.aee_digital_trabalhos}/atividade_generic_quiz_answer?${params}`,
        value
      );
      console.log(
        "trabalhos.controller.getQuizResponseByParams: Success=>",
        quiz_response.data
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
    console.log(params);

    try {
      const quiz_response = await axios.post(
        `${config.aee_digital_trabalhos}/atividade_generic_quiz_answer`,
        params
      );
      console.log(
        "trabalhos.controller.getQuizResponseByParams: Success=>",
        quiz_response.data
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
