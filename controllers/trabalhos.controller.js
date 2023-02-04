const CacheableController = require("./cacheable.controller")

module.exports = class trabalhosController extends CacheableController {
  constructor() {
    super({
      service: "aee_digital_trabalhos"
    })

  }


  //TODO
  async updateCoordResponseByCentroId(questionId, answerid, response) {
    let c = this.cache.coord_responses;

    let questionToUpdate = c.find((m) => {
      return m.QUESTION_ID === questionId && m._id === answerid;
    });

    if (questionToUpdate) {
      questionToUpdate.ANSWER = response;
    }
  }

  async getAtividades() {
    return await this.get('atividade')
  }

  async getAtividadesCentroByParams(params) {
    return await this.get('atividade_centro', params)
  }

  async getAtividadesCentroSummaryByParams(params) {
    return await this.get('atividade_centro_summary', params)
  }

  async getFormByParams(params) {
    try {
      return await this.get('atividade_generic_form', params)  
    } catch (error) {
      this.logger.error(`trabalhos.getFormByParams ${error}`)
      throw error
    }
    
  }

  async getQuizTemplates() {
    return await this.get('atividade_generic_quiz')
  }

  async getQuizTemplateByParams(params) {
    return await this.get('atividade_generic_quiz', params)
  }

  async getQuestionByParams(params) {
    return await this.get('atividade_generic_question', params)
  }

  async getGroupQuestionByParams(params) {
    return await this.get('atividade_generic_group_question', params)
  }

  async getQuizResponseByParams(params) {
    return await this.get('atividade_generic_quiz_answer', params)
  }

  async deleteQuizResponseByParams(params) {
    return await this.delete('atividade_generic_quiz_answer', params)
  }

  async updatePass(params, value) {
    return await this.put('pass', params, value)
  }

  async getPasses() {
    try {
      return await this.get('pass')
    } catch (error) {
      this.logger.error(`trabalhos.controllergetPasses ${error}`)
      throw error
    }
  }


  async getSummaries(start, end) {
    let params = {
      fields: "CENTRO_ID,LASTMODIFIED,ID"
    }

    let summaries = await this.get('atividade_generic_quiz_summary', params)

    if (start) {
      let startDateParts = start.split("/")

      let endDateParts
      let endDate
      let startDate = new Date(startDateParts[2], startDateParts[1] - 1, startDateParts[0])

      if (end) {
        endDateParts = end.split("/")
        endDate = new Date(endDateParts[2], endDateParts[1] - 1, endDateParts[0])
      } else {
        end = Date.now()
      }

      summaries = summaries.filter((response) => {
        const responseDate = new Date(response.LASTMODIFIED)

        return responseDate >= startDate && responseDate <= endDate

      })
    }

    return summaries
  }

  async getPassByParams(params) {
    try {
      return await this.get('pass', params)
      
    } catch (error) {
      this.logger.error(`trabalhos.controllergetPasses ${error}`)
      throw error
    }
  }


  async putQuizResponse(params, value) {
    return await this.put('atividade_generic_quiz_answer', params, value)
  }

  async postQuizResponse(body) {
    return await this.post('atividade_generic_quiz_answer', body)
  }

  async getQuizResponses() {
    return await this.get('atividade_generic_quiz_answer')
  }

  

  async getPessoaByParams(params) {
    return await this.get('pessoa', params)
  }

  async getQuizSummaryByParams(params) {
    return await this.get('atividade_generic_quiz_summary', params)
  }
  async postQuizSummary(body) {
    return await this.post('atividade_generic_quiz_summary', body)
  }

  async putQuizSummary(params, value) {
    return await this.put('atividade_generic_quiz_summary', params, value)
  }

  async checkFormCompletion(formName, centroId) {
    try {
      let form = await this.getFormByParams({
        NAME: formName
      });

      form = form[0];

      let responses = await this.getQuizResponseByParams({
        CENTRO_ID: centroId
      });

      for (const page of form.PAGES) {
        for (const quiz of page.QUIZES) {
          for (const groupQuestions of quiz.QUESTIONS) {
            for (const question of groupQuestions.GROUP) {
              if (question.IS_REQUIRED) {
                let response = responses.filter((m) => {
                  return (
                    m.CENTRO_ID === centroId &&
                    m.QUIZ_ID === quiz._id &&
                    m.QUESTION_ID === question._id
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