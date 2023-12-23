const CacheableController = require("./cacheable.controller")
const generator = require('generate-password');

module.exports = class apiController extends CacheableController{
  constructor(
  ) {
    super({
      service: "aee_digital_api",
      ttl: 3000
    })
    
  }

  async getRegionais() {
    return await this.get('regionais')
  }

  async getRegionalByParams(params) {
    return await this.get('regionais', params)
  }

  async getCentros() {
    return await this.get('centros')
  }

  async getCentroByParam(params) {
    return await this.get('centros', params)
  }

  async updateCentro(params, value) {
    return await this.patch('centros', params, value)
  }

  async createCentro(body) {
    try {
      return await this.post('centros', body)  
    } catch (error) {
      this.logger.error("Erro criando centro", body, error)
      throw error
    }
  }

  async initializeCentro(centroId){
    try {
      let responses = await this.getQuizResponseByParams({
        CENTRO_ID: centroId,
      });
  
  
      if (responses.length == 0) {
        const cadastroFormName = "Cadastro de Informações Anual";
  
        let form = await this.getFormByParams({
          "NAME": cadastroFormName
        });
  
        form = form[0];
        let pages = form.PAGES;
  
        let answersToAdd = []
  
        pages.forEach(page => {
          const quizes = page.QUIZES;
  
          quizes.forEach((quiz)=>{
            const questions = quiz.QUESTIONS;
            questions.forEach(group=>{
              let GROUP = group.GROUP
              GROUP.forEach(question=>{
                let answerInfo = {
                  CENTRO_ID: centroId,
                  QUIZ_ID: quiz._id,
                  QUESTION_ID: question._id,
                  ANSWER: " ",
                };
  
                answersToAdd.push(answerInfo)
              })
            })
  
          })
  
        });
  
        const answersAdded = await this.postQuizResponse(answersToAdd);

        return answersAdded
      }
    } catch (error) {
      this.logger.error(`Erro Inicializando centro ${centroId}`)
      throw error
    }
    
  }

  async getFormByParams(params) {
    return await this.get('forms', params)
  }

  findQuestionByCategory(form, category) {
    // Iterar sobre as páginas
    for (const page of form.PAGES) {
      // Iterar sobre os quizzes em cada página
      for (const quiz of page.QUIZES) {
        if (quiz.CATEGORY === category) {
          // Se a categoria corresponder, procurar pela questão
          return quiz;
        }
      }
    }
  }

  async getQuestionByParams(params) {
    return await this.get('questions', params)
  }

  async getGroupQuestionByParams(params) {
    return await this.get('questions', params)
  }

  async getQuizResponseByParams(params) {
    return await this.get('answers', params)
  }

  async deleteQuizResponseByParams(params) {
    return await this.delete('answers', params)
  }


  getFakeName(name){
    const nameParts = name.split(" ")
    const parte1 = nameParts[0];
    const parte2 = nameParts.length>1 ? nameParts[1] : ""

     // gerar dois números aleatórios entre 10 e 99
  var num1 = Math.floor(Math.random() * 90) + 10;
  

    const nomeDeUsuario = `${parte1.substring(0, 3)}${parte2.substring(0, 5)}${num1}`;
    return nomeDeUsuario.toLowerCase();
  }

  async setPass(hint,scope_id, groups ){
    const pass = generator.generate({
      length: 6,
      numbers: true
    });

    const passInfo = {
      groups,
      scope_id,
      pass,
      user: this.getFakeName(hint)

    }

    return await this.post('passes', passInfo)
  }

  async getPasses() {
    return await this.get('passes')
  }


  async getSummaries(start, end) {
    let params = {
      fields: "CENTRO_ID,createdAt"
    }

    let summaries = await this.get('summaries', params)

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
        const responseDate = new Date(response.createdAt)

        return responseDate >= startDate && responseDate <= endDate

      })
    }

    return summaries
  }

  async getPassByParams(params) {
    return await this.get('passes', params)
  }


  async putQuizResponse(id, value) {
    return await this.patch('answers', id, value)
  }

  async postQuizResponse(body) {
    return await this.post('answers', body)
  }

  async getPessoasById(id){
    return await this.get('pessoas', id)
  }

  async getPessoaByParams(params) {
    return await this.get('pessoas', params)
  }

  async getQuizSummaryByParams(params) {
    return await this.get('summaries', params)
  }
  async postQuizSummary(body) {
    return await this.post('summaries', body)
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
                    // m.QUIZ_ID === quiz._id &&
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
        `controller:api.controller:checkFormCompletion ${centroId}`
      );
      throw error;
    }
  }
};
