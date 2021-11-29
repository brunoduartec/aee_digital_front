module.exports = class QuizActions {
  constructor(searchcontroller, trabalhocontroller, logger) {
    this.searchcontroller = searchcontroller;
    this.trabalhocontroller = trabalhocontroller;
    this.logger = logger;
  }

  async _getFormInfo(centro_id, form_alias) {
    let option = "Centro";

    let pesquisaInfo = {
      search: centro_id,
      option: option,
    };

    option = "Quiz";

    pesquisaInfo = {
      search: {
        id: centro_id,
        name: form_alias,
      },
      option: option,
    };
    const result = await this.searchcontroller.getPesquisaResult(pesquisaInfo);
    return result;
  }

  async _move(res, action_info) {
    await this.save(res, action_info);

    let { page_redirect, page_index, direction } = action_info;

    let page_to = parseInt(page_index, 10) + direction;
    res.redirect(`${page_redirect}&page=${page_to}`);
  }

  async next(res, action_info) {
    action_info.direction = 1;
    this._move(res, action_info);
  }

  async previous(res, action_info) {
    action_info.direction = -1;
    this._move(res, action_info);
  }

  async save(res, action_info) {
    let { centro_id, form_alias, page_index, responses } = action_info;
    const form_info = await this._getFormInfo(centro_id, form_alias);

    const page = form_info.templates.PAGES[page_index];

    const quizes = page.QUIZES;

    for (let index = 0; index < quizes.length; index++) {
      const quiz = quizes[index];
      const questions = quiz.QUESTIONS;

      for (let j = 0; j < questions.length; j++) {
        const question = questions[j];

        let answer = responses[question._id];
        if (responses[question._id] == "on") answer = "true";

        if (responses[question._id]) {
          if (!question.ANSWER) {
            await trabalhoscontroller.postQuizResponse({
              CENTRO_ID: centro_id,
              QUIZ_ID: quiz._id,
              QUESTION_ID: question._id,
              ANSWER: answer,
            });
          } else if (question.ANSWER != responses[question._id]) {
            let paramsParsed = searchcontroller.getParamsParsed({
              CENTRO_ID: centro_id,
              QUIZ_ID: quiz._id,
              QUESTION_ID: question._id,
            });
            await trabalhoscontroller.putQuizResponse(paramsParsed, {
              ANSWER: answer,
            });
          }
        }
      }
    }
  }

  async send(res, action_info) {
    let { centro_id } = action_info;
    let paramsParsed = `CENTRO_ID=${centro_id}`;

    const quiz_responses =
      await this.trabalhocontroller.getQuizResponseByParams(paramsParsed);

    const responses = quiz_responses.map((m) => m.ID);

    if (responses.length > 0) {
      let params = {
        CENTRO_ID: centro_id,
        ANSWERS: responses,
      };
      const summary = await this.trabalhocontroller.postQuizSummary(params);
    }
  }

  async pdf(res, action_info) {
    const centro_id = action_info.centro_id;
    let pageToRender = `http://localhost:4200/cadastro_alianca?ID=${centro_id}&page=4`;
    res.redirect(`pdf?target=${pageToRender}`);
  }

  async open(res, action_info) {
    let { centro_id, form_alias, page } = action_info;
    const form_info = await this._getFormInfo(centro_id, form_alias);

    this.logger.info("get:cadastro_alianca", JSON.stringify(form_info));

    res.render("pages/quiz", {
      index: page,
      form_alias: form_alias,
      centro_id: centro_id,
      results: form_info.templates,
      titles: form_info.titles,
    });
  }
};
