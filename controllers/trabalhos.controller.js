const IController = require("./icontroller")

module.exports = class trabalhosController extends IController {
  constructor(
    parser = require("../helpers/parser"),
    Request = require("../helpers/request")
  ) {
    
    super("trabalhos")

    this.parser = parser;
    this.request = new Request();

  }

  async initialize() {
    try {
      const formatedKey = this.getKeyFormated(`initialized`)
      const initialized = await this.cache.get(formatedKey)
      if(!initialized){
        await this.generateInfoByCache();
        await this.cache.set(formatedKey,true)
      }
      
    } catch (error) {
      throw new Error(error)
    }
  }

  async getFormQuestions(questionName) {
    const formatedKey = this.getKeyFormated(`form:${questionName}`)
    const formCached = await this.cache.get(formatedKey)

    return formCached[questionName]
  }

  async generateFormQuestionCache() {
    const cadastroFormName = "Cadastro de Informações Anual";
      const params = {
        NAME: cadastroFormName,
      };
      let form = await this.getFormByParams(
        this.parser.getParamsParsed(params)
      );

    const formTemplateInfo = form[0];
    let pages = formTemplateInfo.PAGES;
    
    const formatedKey = this.getKeyFormated(`form:${questionName}`)
    await this.cache.remove(formatedKey)

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

      await this.cache.set(formatedKey,pageInfo)
    }
  }

  async generateCoordQuizCache(){
    let paramsParsed = this.parser.getParamsParsed({
      CATEGORY: "Coordenador",
    });
    let coord_quiz = await this.getQuizTemplateByParams(paramsParsed);
    let formatedKey = this.getKeyFormated(`coord_quiz`)
    await this.cache.set(formatedKey,coord_quiz) 

    paramsParsed = this.parser.getParamsParsed({
        QUIZ_ID: coord_quiz[0].ID,
      });
    const coord_responses = await this.getQuizResponseByParams(
      paramsParsed
    );

    formatedKey = this.getKeyFormated(`coord_responses`)
    await this.cache.set(formatedKey, coord_responses)
  }

  async generateInfoByCache() {
    try {
      this.logger.info(
        `controller:trabalhos.controller:Start Caching Trabalho`
      );

      await this.generateCoordQuizCache()

      this.getSummaries();

      await this.generateFormQuestionCache();
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller: error reading cache: ${error}`
      );
      throw error;
    }
  }

  async getCoordResponses(){
    const formatedKey = this.getKeyFormated(`coord_responses`)
    const coord_responses = await this.cache.get(formatedKey)
    return coord_responses
  }

  async getCoordResponsesByCentroId(centroid) {
    try {
      const formatedKey = this.getKeyFormated(`coord_responses`)
      const coord_responses = await this.cache.get(formatedKey)

      if(coord_responses){
        return coord_responses.filter((m) => {
          return m.CENTRO_ID == centroid;
        });
      }

    } catch (error) {
      this.logger.error(
        `trabalhocontroller:getCoordResponsesByCentroId: ${error}`
      );
      throw error;
    }
  }

  async checkQuestionInCoordQuiz(questionId) {

    const formatedKey = this.getKeyFormated(`coord_quiz`)
    const coord_quiz = await this.cache.get(formatedKey)
    
    let questions =coord_quiz[0].QUESTIONS[0].GROUP;

    return questions.find((m) => {
      return m._id === questionId;
    });
  }

  async updateCoordResponseByCentroId(questionId, answerid, response) {
    // let c = this.cache.coord_responses;
    const formatedKey = this.getKeyFormated(`coord_responses`)
    let c = await this.cache.get(formatedKey)

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

      const formatedKey = this.getKeyFormated(`atividade_centro_summary:${params}`)
      const getAtividadesCentroSummaryByParams = await this.cache.get(formatedKey)
      
      if(getAtividadesCentroSummaryByParams)
      {
        return getAtividadesCentroSummaryByParams;
      } else {
        const atividades = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_centro_summary?${params}`
        );

        await this.cache.set(formatedKey, atividades)

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
      const formatedKey = this.getKeyFormated(`atividade_generic_form:${params}`)
      let form = await this.cache.get(formatedKey)

      if(form){
        return form
      }else{
        const form = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_form?${params}`
        );
  
        // this.logger.info(
        //   `controller:trabalhos.controller:getFormByParams => ${JSON.stringify(
        //     form
        //   )}`
        // );
        await this.cache.set(formatedKey,form)
        return form;
      }


      
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getFormByParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async getQuizTemplates() {
    try {

      const formatedKey = this.getKeyFormated(`atividade_generic_quiz`)
      let quiz = awaitthis.cache.get(formatedKey)

      if(quiz){
        return quiz
      }else{
        quiz = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_quiz`
        );
  
        // this.logger.info(
        //   `controller:trabalhos.controller:getQuizTemplates ${JSON.stringify(
        //     quiz
        //   )}`
        // );

        await this.cache.set(formatedKey,quiz)
        return quiz;
      }

      
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getQuizTemplates: Error=> ${error}`
      );
      throw error;
    }
  }

  async getQuizTemplateByParams(params) {
    try {

      const formatedKey = this.getKeyFormated(`atividade_generic_quiz:${params}`)
      let quiz = await this.cache.get(formatedKey)

      if(quiz){
        return quiz
      }
      else{
        quiz = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_quiz?${params}`
        );
  
        // this.logger.info(
        //   `controller:trabalhos.controller:getQuizTemplateByParams ${JSON.stringify(
        //     quiz
        //   )}`
        // );
        await this.cache.set(formatedKey,quiz)
        return quiz;

      }
      
    } catch (error) {
      this.logger.error(
        `trabalhos.controller.getQuizTemplateByParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async getQuestionByParams(params) {
    try {

      const formatedKey = this.getKeyFormated(`atividade_generic_question:${params}`)
      let question = await this.cache.get(formatedKey)

      if(question){
        return question
      }
      else{
        question = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_question?${params}`
        );
  
        // this.logger.info(
        //   `controller:trabalhos.controller:getQuestionByParams ${quiz}`
        // );

        await this.cache.set(formatedKey,question)
        return question;
      }


     
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getQuestionByParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async getGroupQuestionByParams(params) {
    try {

      const formatedKey = this.getKeyFormated(`atividade_generic_group_question:${params}`)
      let group = await this.cache.get(formatedKey)

      if(group){
        return group
      }
      else{
        group = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_group_question?${params}`
        );
  
        // this.logger.info(
        //   `controller:trabalhos.controller:getGroupQuestionByParams ${quiz}`
        // );
        await thi.cache.set(formatedKey,group)
        return group;
      }

      
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getGroupQuestionByParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async getRequiredQuestions() {
    try {
      const formatedKey = this.getKeyFormated(`getRequiredQuestions`)
      const questions = await this.cache.get(formatedKey)

      if(questions){
        return questions
      }
      else{
        questions = await this.getQuestionByParams(
          this.parser.getParamsParsed({
            IS_REQUIRED: true,
          })
        );

        await this.cache.set(formatedKey,questions)
  
        return questions;
      }

    
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getRequiredQuestions: Error=> ${error}`
      );
      throw error;
    }
  }

  async getQuizResponseByParams(params) {
    try {
      const unparsedParams = this.parser.getQueryParamsParsed(params)
      let formatedKey = this.getKeyFormated(`atividade_generic_quiz_answer`)

      if(unparsedParams.CENTRO_ID){
        formatedKey = formatedKey.concat(`:CENTROID:${unparsedParams.CENTRO_ID}`)
      }
      
      if(unparsedParams["QUESTION_ID._id"]){
        formatedKey = formatedKey.concat(`:QUESTION_ID._id:${unparsedParams["QUESTION_ID._id"]}`)
      }


      if(unparsedParams["QUESTION_ID.IS_REQUIRED"]){
        formatedKey = formatedKey.concat(`:QUESTION_ID.IS_REQUIRED:${unparsedParams["QUESTION_ID.IS_REQUIRED"]}`)
      }
      

      if(unparsedParams["_id"]){
        formatedKey = formatedKey.concat(`:_id:${unparsedParams["_id"]}`)
      }

      if(unparsedParams["QUIZ_ID"]){
        formatedKey = formatedKey.concat(`:QUIZ_ID:${unparsedParams["QUIZ_ID"]}`)
      }

      if(unparsedParams["QUESTION_ID._id"]){
        formatedKey = formatedKey.concat(`:QUESTION_ID._id:${unparsedParams["QUESTION_ID._id"]}`)
      }


      // const formatedKey = this.getKeyFormated(`atividade_generic_quiz_answer:${params}`)
      let quiz_response = await this.cache.get(`${formatedKey}`)

      if(quiz_response){
        return quiz_response
      }
      else{
        let quiz_response = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_quiz_answer?${params}`
        );
  
        await this.cache.set(formatedKey,quiz_response)
        return quiz_response;
      }

    
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

      const formatedKey = this.getKeyFormated(`atividade_generic_quiz_answer:${params}`)
      await await this.cache.remove(formatedKey)

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

      const formatedKey = this.getKeyFormated(`pass:${params}`)
      
      await this.cache.remove( this.getKeyFormated("pass"))
      await this.cache.set(formatedKey, pass)

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
      const formatedKey = this.getKeyFormated(`pass`)
      const passes = await this.cache.get(formatedKey)

      if(passes){
        return passes
      }else{
        const passes = await this.request.get(
          "aee_digital_trabalhos",
          `/pass`
        );
  
        // this.logger.info(
        //   `controller:trabalhos.controller:getPasses ${atividades}`
        // );
        await this.cache.set(formatedKey,passes)
        return passes;
      }

      
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getPasses: Error=> ${error}`
      );
      throw error;
    }
  }

  async getSummaries() {
    try {
      const formatedKey = this.getKeyFormated(`atividade_generic_quiz_summary`)
      let summaries = await this.cache.get(formatedKey)
      // let summaries = this.localcache.getSummaries
      if(summaries){return summaries}
      else{
        const quiz_summaries = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_quiz_summary`
        );

        let summariesFormated = quiz_summaries.map((s)=>{
          return {
            CENTRO_ID:s.CENTRO_ID,
            LASTMODIFIED: s.LASTMODIFIED,
            ID: s.ID
          }
        })

        await this.cache.set(formatedKey, summariesFormated)
        // this.localcache.getSummaries = summariesFormated;
        
        return summariesFormated;
      }
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getSummaries: Error=> ${error}`
      );
      throw error;
    }
  }

  async putQuizResponse(params, value) {
    try {
      const unparsedParams = this.parser.getQueryParamsParsed(params)

      const quiz_response = await this.request.put(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer?${params}`,
        value
      );

      // const centro_id;

      const formatedKey = this.getKeyFormated(`atividade_generic_quiz_answer`)
      await this.cache.remove(`${formatedKey}:${unparsedParams.CENTRO_ID}` );
      await this.cache.set(`${formatedKey}:${unparsedParams.CENTRO_ID}:${unparsedParams.answerId}`, quiz_response)

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
      const unparsedParams = this.parser.getQueryParamsParsed(params)

      const quiz_response = await this.request.post(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer`,
        params
      );

      // this.logger.info(
      //   `controller:trabalhos.controller:postQuizResponse ${quiz_response}`
      // );

      const formatedKey = this.getKeyFormated(`atividade_generic_quiz_answer`)
       await this.cache.remove(`${formatedKey}:${unparsedParams.CENTRO_ID}` );
       await this.cache.set(`${formatedKey}:${unparsedParams.CENTRO_ID}:${unparsedParams.answerId}`, quiz_response)

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

      const formatedKey = this.getKeyFormated(`atividade_generic_quiz_answer`)
      
      let quiz_response = await this.cache.get(`${formatedKey}`)

      if(quiz_response){
        return quiz_response
      }else{
        quiz_response = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_quiz_answer`
        );
  
        // this.logger.info(
        //   `controller:trabalhos.controller:getQuizResponses ${quiz_response}`
        // );

        await this.cache.set(formatedKey, quiz_response)

        return quiz_response;
      }

      
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getQuizResponses: Error=> ${error}`
      );
      throw error;
    }
  }

  async getPessoaByParams(params) {
    try {
      const formatedKey = this.getKeyFormated(`pessoa:${params}`)
      let pessoa = await this.cache.get(formatedKey)

      if(pessoa){
        return pessoa
      }
      else{
        pessoa = await this.request.get(
          "aee_digital_trabalhos",
          `/pessoa?${params}`
        );
  

        await this.cache.set(`${formatedKey}`, pessoa)
        // this.logger.info(
        //   `controller:trabalhos.controller:getPessoaParams  ${pessoa}`
        // );
        return pessoa;
      }

    
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getPessoaParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async getQuizSummaryByParams(params) {
    try {

      const formatedKey = this.getKeyFormated(`atividade_generic_quiz_summary:${params}`)
      let quiz_summary = await this.cache.get(formatedKey)

      if(quiz_summary){
        return quiz_summary
      }
      else{
        quiz_summary = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_quiz_summary?${params}`
        );
  
        // this.logger.info(
        //   `controller:trabalhos.controller:getQuizSummaryByParams ${quiz_summarie}`
        // );

          await this.cache.set(formatedKey, quiz_summary)

        return quiz_summary;
      }

      
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:getQuizSummaryByParams: Error=> ${error}`
      );
      throw error;
    }
  }
  async postQuizSummary(params) {
    try {
      const formatedKey = this.getKeyFormated(`atividade_generic_quiz_summary`)

      await this.cache.remove(formatedKey)

      const quiz_summary = await this.request.post(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_summary`,
        params
      );

      await this.cache.set(formatedKey, quiz_summary)

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
      const formatedKey = this.getKeyFormated(`atividade_generic_quiz_summary`)

      await this.cache.remove(formatedKey)

      const quiz_summary = await this.request.put(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_summary?${params}`,
        value
      );


      await this.cache.set(formatedKey, quiz_summary)
      // this.logger.info(
      //   `controller:trabalhos.controller:putQuizSummary ${quiz_summary}`
      // );
      return quiz_summary;
    } catch (error) {
      this.logger.error(
        `controller:trabalhos.controller:putQuizSummary: Error=> ${error}`
      );
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
