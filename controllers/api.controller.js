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
  
        let form = await this.getLastFormByParams({
          "NAME": cadastroFormName
        });
  
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

  async getLastFormByParams(params){
    const sortBy= "VERSION:desc"
    params.sortBy = sortBy

    const form = await this.get('forms', params)

    return form[0];
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

  async deleteQuizResponseByParams(id) {
    return await this.delete('answers', id)
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

  async setPass(hint,scope_id, groups, login, password ){
    try {
      
      let pass;
      if(!password){
        pass = generator.generate({
          length: 6,
          numbers: true
        });
      }
      else{
        pass = password
      }
  
      let user;
      if(!login){
        user = this.getFakeName(hint)
      }
      else{
        user = login;
      }
  
      const passInfo = {
        groups,
        scope_id,
        pass,
        user
      }

      const response = await this.post('passes', passInfo)
  
      return response
    } catch (error) {
      this.logger("error at create passes", error)
      throw error;
    }
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


  async patchQuizResponse(id, value) {
    return await this.patch('answers', id, value)
  }

  async putQuizResponse(params, value) {
    return await this.put('answers', params, value)
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


  async getRequiredQuestionsNotAnswered(formName, centroId){

    const [responses, form]= await Promise.all([
      await this.getQuizResponseByParams({ CENTRO_ID: centroId, fields: "ANSWER, QUESTION_ID" }),
      await this.getLastFormByParams({ NAME: formName})
    ]);

    const questions = [];

    form.PAGES.forEach(page=>{
      page.QUIZES.forEach(quiz=>{
        quiz.QUESTIONS.forEach(questionGroup=>{
          questionGroup.GROUP.forEach(q=>{
            if(q.IS_REQUIRED)
            questions.push(q)
          })
        })
      })
    })

    let not_finished = [];

    questions.forEach(question => {
      const hasResponse = responses.find((response)=>{
        return response.QUESTION_ID == question._id
      })

      if(!hasResponse  ||  hasResponse?.ANSWER?.trim().length == 0){
        not_finished.push(question.QUESTION)
      }
      
    });

    return not_finished;
  }

  async checkFormCompletion(formName, centroId) {
    try {
      const hasUnresoldedQuestions = (await this.getRequiredQuestionsNotAnswered(formName, centroId)).length == 0;
      return hasUnresoldedQuestions;
    } catch (error) {
      this.logger.error(
        `controller:api.controller:checkFormCompletion ${centroId}`
      );
      throw error;
    }
  }
};
