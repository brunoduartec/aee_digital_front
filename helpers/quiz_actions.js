module.exports = class QuizActions {
  constructor(
    UserInfoController = require("../controllers/userInfo.controller"),
    Controller = require("../controllers/api.controller"),
    logger = require("../helpers/logger"),
    parser = require("../helpers/parser")
  ) {
    this.userinfocontroller = new UserInfoController();
    this.controller = new Controller();
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
    this._move(req, res, action_info);
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
              await this.controller.postQuizResponse({
                CENTRO_ID: centro_id,
                QUIZ_ID: quiz._id,
                QUESTION_ID: question._id,
                ANSWER: answer,
              });
            } else if (question.ANSWER != responses[question._id]) {
              await this.controller.putQuizResponse(question.ANSWER_ID, { ANSWER: answer, });
            }
          }
        }
      }
    }
  }

  async send(req, res, action_info) {
    let { centro_id, form_id } = action_info;

    const quiz_responses = await this.controller.getQuizResponseByParams({ CENTRO_ID: centro_id });

    const quizResponsesMapped = quiz_responses.map((response)=>{ return {
      QUESTION: response._id,
      ANSWER: response.ANSWER 
    }
    })

    let params = {
      CENTRO_ID: centro_id,
      FORM_ID: form_id,
      QUESTIONS: quizResponsesMapped,
      // LASTMODIFIED: new Date(),
    };
    await this.controller.postQuizSummary(params);

    res.render("pages/thanks", {
      message:""
    });
  }

  async pdf(req, res, action_info) {
    const centro_id = action_info.centro_id;
    let pageToRender = `http://localhost:4200/cadastro_alianca?ID=${centro_id}&page=4`;
    res.redirect(`pdf?target=${pageToRender}`);
  }

  async open(req, res, action_info) {
    let { centro_id, form_alias, form_id, page } = action_info;
    try {
      const form_info = await this.userinfocontroller.getFormInfo(
        centro_id,
        form_alias,
        page,
        req?.user?.groups
      );

      this.logger.info(
        `helpers:quiz_actions:open => ${centro_id}`
      );

      res.render("pages/quiz", {
        index: page,
        form_alias: form_alias,
        form_id,
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
