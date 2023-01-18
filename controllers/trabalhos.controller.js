const commonHelper = require("../helpers/common.helper")
module.exports = class trabalhosController {
  constructor(
    parser = require("../helpers/parser"),
    logger = require("../helpers/logger"),
    Request = require("../helpers/request")
  ) {
    const instance = this.constructor.instance;
    if (instance) {
      return instance;
    }

    this.parser = parser;
    this.logger = logger;
    this.request = new Request();

    this.cache = {};
    this.constructor.instance = this;
  }

  async initialize() {
    await this.generateInfoByCache();
  }

  async getFormQuestions(questionName) {
    return this.cache.form ? this.cache.form[questionName] : null;
  }

  async setFormQuestions(formTemplate, questionName) {
    const formTemplateInfo = formTemplate[0];
    let pages = formTemplateInfo.PAGES;
    if (!this.cache.form) {
      this.cache.form = {};
    }
    this.cache.form[questionName] = [];

    for (let index = 0; index < pages.length; index++) {
      let pageInfo = [];

      const page = pages[index];

      let quizes = page.QUIZES;
      for (let index = 0; index < quizes.length; index++) {
        const quiz = quizes[index];

        let groups = quiz.QUESTIONS;

        for (let j = 0; j < groups.length; j++) {
          const group = groups[j].GROUP;

          for (let k = 0; k < group.length; k++) {
            let question = group[k];
            question.CATEGORY = quiz.CATEGORY;
            question.QUIZ_ID = quiz._id;
            pageInfo.push(question);
          }
        }
      }

      this.cache.form[questionName].push(pageInfo);
    }
  }

  async generateInfoByCache() {
    try {
      let paramsParsed = this.parser.getParamsParsed({
        CATEGORY: "Coordenador",
      });

      this.logger.info(
        `controller:trabalhos.controller:Start Caching Trabalho`
      );

      let coord_quiz = await this.getQuizTemplateByParams(paramsParsed);

      this.cache.coord_quiz = coord_quiz;

      paramsParsed = this.parser.getParamsParsed({
        QUIZ_ID: coord_quiz[0].ID,
        fields:"QUESTION_ID._id,_id,ANSWER"
      });

      this.cache.coord_responses = await this.getQuizResponseByParams(
        paramsParsed
      );

      this.getSummaries();

      const cadastroFormName = "Cadastro de Informações Anual";
      const params = {
        NAME: cadastroFormName,
      };
      let form = await this.getFormByParams(
        this.parser.getParamsParsed(params)
      );

      await this.setFormQuestions(form, cadastroFormName);
      this.logger.info(`controller:trabalhos.controller:generateInfoByCache`);
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller: error reading cache: ${error}`
      );
      throw error;
    }
  }

  async getCoordResponsesByCentroId(centroid) {
    try {
      return this.cache.coord_responses.filter((m) => {
        return m.CENTRO_ID == centroid;
      });
    } catch (error) {
      this.logger.error(
        `trabalhocontroller:getCoordResponsesByCentroId: ${error}`
      );
      throw error;
    }
  }

  checkQuestionInCoordQuiz(questionId) {
    let questions = this.cache.coord_quiz[0].QUESTIONS[0].GROUP;

    return questions.find((m) => {
      return m._id === questionId;
    });
  }

  async updateCoordResponseByCentroId(questionId, answerid, response) {
    let c = this.cache.coord_responses;

    let questionToUpdate = c.find((m) => {
      return m.QUESTION_ID._id === questionId && m.ID === answerid;
    });

    if (questionToUpdate) {
      questionToUpdate.ANSWER = response;
    }
  }

  async getAtividades() {
    try {
      const atividades = await this.request.get(
        "aee_digital_trabalhos",
        `/atividade`
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:getAtividades: ${atividades}`
      // );

      return atividades;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getAtividades: Error=> ${error}`
      );
      throw error;
    }
  }

  async getAtividadesCentroByParams(params) {
    try {
      const atividades = await this.request.get(
        "aee_digital_trabalhos",
        `/atividade_centro?${params}`
      );
      // this.logger.info(
      //   `controller:trabalhos.controller:getAtividadesCentroByParams => ${atividades}`
      // );

      return atividades;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getAtividadesCentroByParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async getAtividadesCentroSummaryByParams(params) {
    try {
      if (
        !this.cache.getAtividadesCentroSummaryByParams &&
        this.cache.getAtividadesCentroSummaryByParams[params]
      ) {
        return this.cache.getAtividadesCentroSummaryByParams[params];
      } else {
        const atividades = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_centro_summary?${params}`
        );

        if (!this.cache.getAtividadesCentroSummaryByParams) {
          this.cache.getAtividadesCentroSummaryByParams = {};
        }

        this.cache.getAtividadesCentroSummaryByParams[params] = atividades;

        // this.logger.info(
        //   `controller:trabalhos.controller:getAtividadesCentroSummaryByParams", ${atividades}`
        // );
        return atividades;
      }
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getAtividadesCentroSummaryByParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async getFormByParams(params) {
    try {
      const form = await this.request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_form?${params}`
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:getFormByParams => ${JSON.stringify(
      //     form
      //   )}`
      // );
      return form;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getFormByParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async getQuizTemplates() {
    try {
      const quiz = await this.request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz`
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:getQuizTemplates ${JSON.stringify(
      //     quiz
      //   )}`
      // );
      return quiz;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getQuizTemplates: Error=> ${error}`
      );
      throw error;
    }
  }

  async getQuizTemplateByParams(params) {
    try {
      const quiz = await this.request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz?${params}`
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:getQuizTemplateByParams ${JSON.stringify(
      //     quiz
      //   )}`
      // );
      return quiz;
    } catch (error) {
      this.logger.error(
        `trabalhos.controller.getQuizTemplateByParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async getQuestionByParams(params) {
    try {
      const quiz = await this.request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_question?${params}`
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:getQuestionByParams ${quiz}`
      // );
      return quiz;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getQuestionByParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async getGroupQuestionByParams(params) {
    try {
      const quiz = await this.request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_group_question?${params}`
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:getGroupQuestionByParams ${quiz}`
      // );
      return quiz;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getGroupQuestionByParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async getRequiredQuestions() {
    try {
      const requiredQuestions = await this.getQuestionByParams(
        this.parser.getParamsParsed({
          IS_REQUIRED: true,
        })
      );

      return requiredQuestions;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getRequiredQuestions: Error=> ${error}`
      );
      throw error;
    }
  }

  async getQuizResponseByParams(params) {
    try {
      const quiz_response = await this.request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer?${params}`
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:getQuizResponseByParams ${JSON.stringify(
      //     quiz_response
      //   )}`
      // );
      return quiz_response;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getQuizResponseByParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async deleteQuizResponseByParams(params) {
    try {
      const quiz_response = await this.request.delete(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer?${params}`
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:deleteQuizResponseByParams ${quiz_response}`
      // );
      return quiz_response;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:deleteQuizResponseByParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async updatePass(params, value) {
    try {
      const pass = await this.request.put(
        "aee_digital_trabalhos",
        `/pass?${params}`,
        value
      );

      this.logger.info(
        `controller:trabalhos.controller:updatePass => ${JSON.stringify(pass)}`
      );
      return pass;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:updatePass: Error=> ${error}`
      );
      throw error;
    }
  }

  async getPasses() {
    try {
      const atividades = await this.request.get(
        "aee_digital_trabalhos",
        `/pass`
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:getPasses ${atividades}`
      // );
      return atividades;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getPasses: Error=> ${error}`
      );
      throw error;
    }
  }

  

  async getSummaries(data) {
    let removeFields
    if(data){
      removeFields = data.removeFields
    }
    try {
      let summaries;
      if (this.cache.getSummaries) {
          summaries = this.cache.getSummaries;
      } else {
        const quiz_summaries = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_quiz_summary`
        );

        this.cache.getSummaries = quiz_summaries;
        summaries = quiz_summaries
      }

      if(removeFields){
        summaries = commonHelper.getArrayOmitingParams(summaries,removeFields)
      }

      return summaries
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getSummaries: Error=> ${error}`
      );
      throw error;
    }
  }

  async getPassByParams(params) {
    try {
      const passes = await this.request.get(
        "aee_digital_trabalhos",
        `/pass?${params}`
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:getPassByParams => ${JSON.stringify(
      //     passes
      //   )}`
      // );
      return passes;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getPassByParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async postPass(params) {
    try {
      const pass = await this.request.post(
        "aee_digital_trabalhos",
        `/pass`,
        params
      );

      // this.logger.info(`controller:trabalhos.controller:postPass => ${pass}`);
      return pass;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:postPass: Error=> ${error}`
      );
      throw error;
    }
  }

  async putQuizResponse(params, value) {
    try {
      const quiz_response = await this.request.put(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer?${params}`,
        value
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:putQuizResponse ${quiz_response}`
      // );
      return quiz_response;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:putQuizResponse: Error=> ${error} `
      );
      throw error;
    }
  }

  async postQuizResponse(params) {
    try {
      const quiz_response = await this.request.post(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer`,
        params
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:postQuizResponse ${quiz_response}`
      // );
      return quiz_response;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:postQuizResponse: Error=> ${error}`
      );
      throw error;
    }
  }

  async getQuizResponses() {
    try {
      const quiz_response = await this.request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer`
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:getQuizResponses ${quiz_response}`
      // );
      return quiz_response;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getQuizResponses: Error=> ${error}`
      );
      throw error;
    }
  }

  async getPessoaByParams(params) {
    try {
      const pessoa = await this.request.get(
        "aee_digital_trabalhos",
        `/pessoa?${params}`
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:getPessoaParams  ${pessoa}`
      // );
      return pessoa;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getPessoaParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async getQuizSummaryByParams(params) {
    try {
      const quiz_summarie = await this.request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_summary?${params}`
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:getQuizSummaryByParams ${quiz_summarie}`
      // );
      return quiz_summarie;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getQuizSummaryByParams: Error=> ${error}`
      );
      throw error;
    }
  }
  async postQuizSummary(params) {
    try {
      this.cache.getSummaries = null;

      const quiz_summary = await this.request.post(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_summary`,
        params
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:postQuizSummary ${quiz_summary}`
      // );
      return quiz_summary;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:postQuizSummary: Error=> ${error}`
      );
      throw error;
    }
  }

  async putQuizSummary(params, value) {
    try {
      this.cache.getSummaries = null;

      const quiz_summary = await this.request.put(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_summary?${params}`,
        value
      );

      return quiz_summary;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:putQuizSummary: Error=> ${error}`
      );
      throw error;
    }
  }

  async initializeAnswers(centroId, questionsPage) {
    try {
      
      let answersToAdd = [];

      for (let index = 0; index < questionsPage.length; index++) {
        const questions = questionsPage[index];

        for (let l = 0; l < questions.length; l++) {
          const question = questions[l];

            let answerInfo = {
              CENTRO_ID: centroId,
              QUIZ_ID: question.QUIZ_ID,
              QUESTION_ID: question._id,
              ANSWER: " ",
            };
            answersToAdd.push(answerInfo);
          
        }
      }

      await this.postQuizResponse(answersToAdd);
      return answersToAdd;
      
    } catch (error) {
      this.logger.error(`Insert Answers ${error}`);
      throw error;
    }
  }

  async checkFormCompletion(formName, centroId) {
    try {
      let form = await this.getFormByParams(
        this.parser.getParamsParsed({
          NAME: formName,
        })
      );

      form = form[0];

      let responses = await this.getQuizResponseByParams(
        this.parser.getParamsParsed({
          CENTRO_ID: centroId,
        })
      );

      for (const page of form.PAGES) {
        for (const quiz of page.QUIZES) {
          for (const groupQuestions of quiz.QUESTIONS) {
            for (const question of groupQuestions.GROUP) {
              if (question.IS_REQUIRED) {
                let response = responses.filter((m) => {
                  return (
                    m.CENTRO_ID === centroId &&
                    m.QUIZ_ID === quiz._id &&
                    m.QUESTION_ID._id === question._id
                  );
                });

                if (response.length == 0) {
                  return false;
                } else if (response[0].ANSWER == " ") {
                  return false;
                }
              }
            }
          }
        }
      }
      return true;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:checkFormCompletion ${centroId}`
      );
      throw error;
    }
  }
};
