module.exports = class trabalhosController {
  constructor(parser, logger, request) {
    this.parser = parser;
    this.logger = logger;
    this.request = request;
    this.cache={}
  }

  async generateInfoByCache(){
    try {

      let paramsParsed  = this.parser.getParamsParsed({
        CATEGORY: "Coordenador"
      })

      this.logger.info(`Start Caching Trabalho`)

      let coord_quiz = await this.getQuizTemplateByParams(paramsParsed);

      this.cache.coord_quiz = coord_quiz

      paramsParsed = this.parser.getParamsParsed({
        QUIZ_ID : coord_quiz[0].ID
      })

      this.cache.coord_responses = await this.getQuizResponseByParams(paramsParsed)

      this.getSummaries();

      this.logger.info(`trabalhoscontroller:generateInfoByCache`)
    } catch (error) {
      this.logger.error(`trabalhocontroller error reading cache: ${error}`)
      throw error
    }
  }

 
  async getCoordResponsesByCentroId(centroid){
    try {
      return this.cache.coord_responses.filter(m=>{
        return m.CENTRO_ID == centroid
      })
      
    } catch (error) {
      this.logger.error(`trabalhocontroller:getCoordResponsesByCentroId: ${error}`)
      throw error
    }
  }

  checkQuestionInCoordQuiz(questionId){
    let questions = this.cache.coord_quiz[0].QUESTIONS[0].GROUP

    return questions.find(m=>{
      return m._id === questionId
    })
  }

  async updateCoordResponseByCentroId(questionId, answerid, response){
    let c = this.cache.coord_responses;
    
    let questionToUpdate = c.find(m=>{
      return m.QUESTION_ID._id === questionId && m.ID === answerid
    })

    if(questionToUpdate){
      questionToUpdate.ANSWER = response
    }

  }

  async getAtividades() {
    try {
      if(!this.cache.getAtividades){
        return this.cache.getAtividades;
      }else{
        const atividades = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade`
        );
  
        this.logger.info(`getAtividades: ${atividades}`);

        this.cache.atividades = atividades;
        return atividades;

      }
    } catch (error) {
      this.logger.error(`trabalhos.controller.getAtividades: Error=> ${error}`);
      throw error
    }
  }

  async getAtividadesCentroByParams(params) {
    try {
      if(!this.cache.getAtividadesCentroByParams && this.cache.getAtividadesCentroByParams[params]){
        return this.cache.getAtividadesCentroByParams[params];
      }else{
        const atividades = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_centro?${params}`
        );
        this.logger.info(`getAtividadesCentroByParams => ${atividades}`);

        if(!this.cache.getAtividadesCentroByParams){
          this.cache.getAtividadesCentroByParams = {}
        }
        
        this.cache.getAtividadesCentroByParams[params] = atividades;
        return atividades;
      }
    } catch (error) {
      this.logger.error(`trabalhos.controller.getAtividadesCentroByParams: Error=> ${error}`);
      throw error
    }
  }

  async getAtividadesCentroSummaryByParams(params) {
    try {
      if(!this.cache.getAtividadesCentroSummaryByParams && this.cache.getAtividadesCentroSummaryByParams[params]){
        return this.cache.getAtividadesCentroSummaryByParams[params];
      }else{
        const atividades = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_centro_summary?${params}`
        );

        if(!this.cache.getAtividadesCentroSummaryByParams){
          this.cache.getAtividadesCentroSummaryByParams = {}
        }

        this.cache.getAtividadesCentroSummaryByParams[params] = atividades

        this.logger.info(`getAtividadesCentroSummaryByParams", ${atividades}`);
        return atividades;
      }
    } catch (error) {
      this.logger.error( `trabalhos.controller.getAtividadesCentroSummaryByParams: Error=> ${error}` );
      throw error
    }
  }

  async getFormByParams(params) {
    try {

      if(!this.cache.getFormByParams ){this.cache.getFormByParams={}}
      
      if(this.cache.getFormByParams[params]){
        return this.cache.getFormByParams[params];
      }else{
        const form = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_form?${params}`
        );

        this.cache.getFormByParams[params] = form

        this.logger.info(`getFormByParams => ${form}`);
        return form;
      }
    } catch (error) {
      this.logger.error(`trabalhos.controller.getFormByParams: Error=> ${error}`);
      throw error
    }
  }

  async getQuizTemplateByParams(params) {
    try {
      if(!this.cache.getQuizTemplateByParams ){this.cache.getQuizTemplateByParams={}}
      
      if(this.cache.getQuizTemplateByParams[params]){
        return this.cache.getQuizTemplateByParams[params];
      }else{
        const quiz = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_quiz?${params}`
        );

        this.cache.getQuizTemplateByParams[params] = quiz
  
        this.logger.info(`getQuizTemplateByParams ${quiz}`);
        return quiz;

      }
    } catch (error) {
      this.logger.error( `trabalhos.controller.getQuizTemplateByParams: Error=> ${error}` );
      throw error
    }
  }

  async getQuestionByParams(params) {
    try {

      if(!this.cache.getQuestionByParams ){this.cache.getQuestionByParams={}}

      if(this.cache.getQuestionByParams[params]){
        return this.cache.getQuestionByParams[params]
      }else{
        const quiz = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_question?${params}`
        );

        this.cache.getQuestionByParams[params] = quiz;
  
        this.logger.info(`getQuestionByParams ${quiz}`);
        return quiz;

      }
    } catch (error) {
      this.logger.error(`trabalhos.controller.getQuestionByParams: Error=> ${error}`);
      throw error
    }
  }

  async getGroupQuestionByParams(params) {
    try {
      if(!this.cache.getGroupQuestionByParams ){this.cache.getGroupQuestionByParams={}}

      if(this.cache.getGroupQuestionByParams[params]){
        this.logger.info(`getGroupQuestionByParams by cache ${quiz}`);
        return this.cache.getGroupQuestionByParams[params]
      }else{
        const quiz = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_group_question?${params}`
        );

        this.cache.getGroupQuestionByParams[params] = quiz;
  
        this.logger.info(`getGroupQuestionByParams ${quiz}`);
        return quiz;
        
      }
    } catch (error) {
      this.logger.error(`trabalhos.controller.getGroupQuestionByParams: Error=> ${error}`);
      throw error
    }
  }

  async getRequiredQuestions(){

    try {

      if(this.cache.getRequiredQuestions){
        return this.cache.getRequiredQuestions;
      }else{
        const requiredQuestions = await this.getQuestionByParams(this.parser.getParamsParsed({
          "IS_REQUIRED": true
        }))

        this.cache.getRequiredQuestions = requiredQuestions
        return requiredQuestions
      }
      
    } catch (error) {
      this.logger.error( `trabalhos.controller.getRequiredQuestions: Error=> ${error}` );
      throw error
    }
  }

  async getQuizResponseByParams(params) {
    try {
      
      const quiz_response = await this.request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer?${params}`
      );

      this.logger.info(`getQuizResponseByParams ${quiz_response}`);
      return quiz_response;
    } catch (error) {
      this.logger.error( `trabalhos.controller.getQuizResponseByParams: Error=> ${error}` );
      throw error
    }
  }

  async deleteQuizResponseByParams(params) {
    try {
      const quiz_response = await this.request.delete(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer?${params}`
      );

      this.logger.info(`deleteQuizResponseByParams ${quiz_response}`);
      return quiz_response;
    } catch (error) {
      this.logger.error( `trabalhos.controller.deleteQuizResponseByParams: Error=> ${error}` );
      throw error
    }
  }

  async getPasses() {
    try {
      const atividades = await this.request.get("aee_digital_trabalhos", `/pass`);

      this.logger.info(`getPasses ${atividades}`);
      return atividades;
    } catch (error) {
      this.logger.error(`trabalhos.controller.getPasses: Error=> ${error}`);
      throw error
    }
  }

  async getSummaries(){
    
    try {
      if(this.cache.getSummaries){
        return this.cache.getSummaries;
      }else{
        const quiz_summaries = await this.request.get(
          "aee_digital_trabalhos",
          `/atividade_generic_quiz_summary`
        );
  
        this.cache.getSummaries = quiz_summaries;
        this.logger.info(`getSummaries => ${quiz_summaries}`);
        return quiz_summaries;
      }
    } catch (error) {
      this.logger.error(`trabalhos.controller.getSummaries: Error=> ${error}`);
      throw error
    }

  }

  async getPassByParams(params) {
    try {
      const passes = await this.request.get(
        "aee_digital_trabalhos",
        `/pass?${params}`
      );

      this.logger.info(`getPassByParams => ${passes}`);
      return passes;
    } catch (error) {
      this.logger.error(`trabalhos.controller.getPassByParams: Error=> ${error}`);
      throw error
    }
  }

  async postPass(params) {
    try {
      const pass = await this.request.post("aee_digital_trabalhos", `/pass`, params);

      this.logger.info(`postPass => ${pass}`);
      return pass;
    } catch (error) {
      this.logger.error(`trabalhos.controller.postPass: Error=> ${error}`);
      throw error
    }
  }

  async putQuizResponse(params, value) {
    try {
      const quiz_response = await this.request.put(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer?${params}`,
        value
      );

      this.logger.info(`putQuizResponse ${quiz_response}`);
      return quiz_response;
    } catch (error) {
      this.logger.error( `trabalhos.controller.putQuizResponse: Error=> ${error} `);
      throw error
    }
  }

  async postQuizResponse(params) {
    try {
      const quiz_response = await this.request.post(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_answer`,
        params
      );

      this.logger.info(`postQuizResponse ${quiz_response}`);
      return quiz_response;
    } catch (error) {
      this.logger.error( `trabalhos.controller.postQuizResponse: Error=> ${error}` );
      throw error
    }
  }

  async getPessoaByParams(params) {
    try {
      const pessoa = await this.request.get(
        "aee_digital_trabalhos",
        `/pessoa?${params}`
      );

      this.logger.info(`getPessoaParams  ${pessoa}`);
      return pessoa;
    } catch (error) {
      this.logger.error(`trabalhos.controller.getPessoaParams: Error=> ${error}`);
      throw error
    }
  }

  async getQuizSummaryByParams(params) {
    try {
      
      const quiz_summarie = await this.request.get(
        "aee_digital_trabalhos",
        `/atividade_generic_quiz_summary?${params}`
      );

      this.logger.info(`getQuizSummaryByParams ${quiz_summarie}`);
      return quiz_summarie;
    } catch (error) {
      this.logger.error(`trabalhos.controller.getQuizSummaryByParams: Error=> ${error}`);
      throw error
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

      this.logger.info(`postQuizSummary ${quiz_summary}`);
      return quiz_summary;
    } catch (error) {
      this.logger.error(`trabalhos.controller.postQuizSummary: Error=> ${error}`);
      throw error
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

      this.logger.info(`putQuizSummary ${quiz_summary}`);
      return quiz_summary;
    } catch (error) {
      this.logger.error(`trabalhos.controller.putQuizSummary: Error=> ${error}`);
      throw error
    }
  }

  async checkFormCompletion(formName, centroId){
    try {
      let form = await this.getFormByParams(this.parser.getParamsParsed({
        NAME: formName
      }));
  
      form = form[0];
  
      let responses = await this.getQuizResponseByParams(this.parser.getParamsParsed({
        CENTRO_ID: centroId
      }));
  
      for (const page of form.PAGES) {
        for (const quiz of page.QUIZES) {
          for (const groupQuestions of quiz.QUESTIONS) {
            for (const question of groupQuestions.GROUP) {
              if(question.IS_REQUIRED){
                  let response = responses.filter(m=>{
                    return m.CENTRO_ID === centroId && m.QUIZ_ID === quiz._id && m.QUESTION_ID._id === question._id
                  })
  
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
      
    } catch (error) {
      this.logger.error(`checkFormCompletion ${centroId}`)
      throw error
    }
  }
};
