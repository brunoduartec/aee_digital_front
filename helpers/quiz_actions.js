module.exports = class QuizActions {
  constructor(
    trabalhocontroller,
    userinfocontroller,
    regionalcontroller,
    logger,
    parser
  ) {
    this.trabalhocontroller = trabalhocontroller;
    this.userinfocontroller = userinfocontroller;
    this.regionalcontroller = regionalcontroller;
    this.logger = logger;
    this.parser = parser;
  }

  async _move(req, res, action_info) {
    let { page_redirect, page_index, direction } = action_info;

    let page_to = parseInt(page_index, 10) + direction;
    res.redirect(`${page_redirect}&page=${page_to}`);
  }

  async next(req, res, action_info) {
    action_info.direction = 1;
    this._move(req, res, action_info);
  }

  async previous(req, res, action_info) {
    action_info.direction = -1;
    this._move(res, action_info);
  }

  async save(req, res, action_info) {
    let { centro_id, form_alias, page_index, responses } = action_info;
    const form_info = await this.userinfocontroller.getFormInfo(
      centro_id,
      form_alias,
      page_index
    );

    const page = form_info.templates.PAGES[page_index];

    if (!page) {
      return;
    }

    const quizes = page.QUIZES;

    for (let index = 0; index < quizes.length; index++) {
      const quiz = quizes[index];
      const questions = quiz.QUESTIONS;

      for (let j = 0; j < questions.length; j++) {
        const groupQuestion = questions[j].GROUP;

        for (let k = 0; k < groupQuestion.length; k++) {
          const question = groupQuestion[k];
          let answer = responses[question.ANSWER_ID];

          if (responses[question.ANSWER_ID] == "on") answer = "true";

          if (responses[question.ANSWER_ID]) {
            if (!question.ANSWER) {
              await this.trabalhocontroller.postQuizResponse({
                CENTRO_ID: centro_id,
                QUIZ_ID: quiz._id,
                QUESTION_ID: question._id,
                ANSWER: answer,
              });
            } else if (question.ANSWER != responses[question._id]) {
              let paramsParsed = this.parser.getParamsParsed({
                _id: question.ANSWER_ID,
              });
              await this.trabalhocontroller.putQuizResponse(paramsParsed, {
                ANSWER: answer,
              });
            }
          }
        }
      }
    }
  }

  async send(req, res, action_info) {
    let { centro_id } = action_info;

    let paramsParsed = this.parser.getParamsParsed({
      CENTRO_ID: centro_id
    })

    const quiz_responses =
      await this.trabalhocontroller.getQuizResponseByParams(paramsParsed);

    const responses = quiz_responses.map((m) => m.ID);

    let params = {
      CENTRO_ID: centro_id,
      ANSWERS: responses,
      LASTMODIFIED: new Date(),
    };
    await this.trabalhocontroller.postQuizSummary(params);

    res.render("pages/thanks", {});
  }

  async pdf(req, res, action_info) {
    const centro_id = action_info.centro_id;
    let pageToRender = `http://localhost:4200/cadastro_alianca?ID=${centro_id}&page=4`;
    res.redirect(`pdf?target=${pageToRender}`);
  }

  async open(req, res, action_info) {
    let { centro_id, form_alias, page } = action_info;
    try {
      let checkWasInitialized =
        await this.userinfocontroller.checkUserWasInitialized(action_info);

      if (!checkWasInitialized) {
          centro = await this.regionalcontroller.getCentroByParam(`_id=${centro_id}`)
          await this.userinfocontroller.insertAnswers(centro);
      }

      const form_info = await this.userinfocontroller.getFormInfo(
        centro_id,
        form_alias,
        page
      );
 
      // this.logger.info(
      //   `helpers:quiz_actions:open => ${JSON.stringify(form_info)}`
      // ); 

      res.render("pages/quiz", {
        index: page,
        form_alias: form_alias,
        centro_id: centro_id,
        results: form_info.templates,
        titles: form_info.titles,
        canSend: form_info.finalized,
      });
    } catch (error) {
      this.logger.error(`helpers:quiz_actions: open ${error}`);
      throw error;
    }
  }
};
