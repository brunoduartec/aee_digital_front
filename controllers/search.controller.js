const { v4: uuidv4 } = require('uuid');
module.exports = class SearchController {
  constructor(
    Controller = require("./api.controller"),
    role = require('../helpers/role.helper'),
    logger = require("../helpers/logger"),
    parser = require("../helpers/parser")
  ) {
    this.controller = new Controller();
    this.role = role;
    this.logger = logger;
    this.parser = parser;
  }

  async getPesquisaResult(pesquisaInfo) {
    try {
      const search = pesquisaInfo.search;
      const user_role = pesquisaInfo.user_role[0]; // por enquanto ver 1 só

      let name = search.name;
      let centro_id = search.id;
      const page = search.page;
      let finalized = false;

      let form_template = await this.controller.getLastFormByParams({
        NAME: name
      });

      let pages = form_template.PAGES;

      pages = pages.filter((m)=>{
        const canShow = this.role.checkRole(user_role, m.ROLE);
        return canShow
      })

      let page_titles = pages.map((m) => { return m.PAGE_NAME });

      if (page < page_titles.length) {
        let page_info = pages[page];
        pages = [];
        pages.push(page_info);
      } else {
        finalized = await this.controller.checkFormCompletion(
          name,
          centro_id
        );
      }

      const quiz_responses = await this.controller.getQuizResponseByParams({
        CENTRO_ID: centro_id,
        fields: "QUESTION_ID,_id,ANSWER"
      });

      for (let index = 0; index < pages.length; index++) {
        const page = pages[index];

        const canShow = page_titles.includes(page.PAGE_NAME)

        if (canShow) {
          let quizes = page.QUIZES;
          for (let index = 0; index < quizes.length; index++) {
            const quiz = quizes[index];

            let groups = quiz.QUESTIONS;

            for (let j = 0; j < groups.length; j++) {
              const groupInfo = groups[j]
              groupInfo._id = uuidv4();
              const group = groupInfo.GROUP;
              for (let k = 0; k < group.length; k++) {
                const question = group[k];

                let answer

                if (groupInfo.IS_MULTIPLE) {
                  answer = quiz_responses.filter((m) => {
                    return m.QUESTION_ID == question._id;
                  });

                } else {
                  const itemFound = quiz_responses.findLast((m) => {
                    return m.QUESTION_ID == question._id;
                  })
                  answer = [itemFound || " "];
                }

                if (answer.length > 0) {
                  question.ANSWER = JSON.parse(
                    JSON.stringify(
                      answer.map((m) => {
                        return m.ANSWER;
                      })
                    )
                  );
                  question.ANSWER_ID = JSON.parse(
                    JSON.stringify(
                      answer.map((m) => {
                        return m._id;
                      })
                    )
                  );
                }
              }
            }
          }
        }
      }

      let quiz = {
        templates: form_template,
        titles: page_titles,
        finalized: finalized
      };

      this.logger.debug(
        `controller:search.controller:getPesquisaResult:Quiz`
      );
      return quiz;
    } catch (error) {
      this.logger.error(`searchcontroller :${error}`)
      throw error;
    }


  }
}