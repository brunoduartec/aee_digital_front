module.exports = class UserInfoController {
  constructor(
    regionalcontroller,
    centroinfocontroller,
    trabalhocontroller,
    searchcontroller,
    logger = require("../helpers/logger"),
    parser = require("../helpers/parser")
  ) {
    this.regionalcontroller = regionalcontroller;
    this.centroinfocontroller = centroinfocontroller;
    this.trabalhocontroller = trabalhocontroller;
    this.searchcontroller = searchcontroller;

    this.depara = require("../resources/de-para.json");

    this.logger = logger;
    this.parser = parser;
  }

  getInfo(item, param) {
    let sub_params = param.split(".");
    let sub;

    if (sub_params.includes("*")) {
      sub = [];
      let index = sub_params.indexOf("*");
      let sub_sub_param = [];
      for (let i = 0; i < index; i++) {
        sub_sub_param.push(sub_params[i]);
      }
      let sub_item = this.parser.getNestedObject(item, sub_sub_param);

      if (sub_item) {
        for (let i = 0; i < sub_item.length; i++) {
          const it = sub_item[i];
          const subToPush = this.parser.getNestedObject(it, [
            sub_params[index + 1],
          ]);
          sub.push(subToPush);
        }
      } else {
        sub.push(" ");
      }

      return sub;
    } else {
      sub = this.parser.getNestedObject(item, sub_params);
      return sub;
    }
  }

  async insertAnswers(centro) {
    try {
  
      const cadastroFormName = "Cadastro de Informações Anual";

      let questionsPage = await this.trabalhocontroller.getFormQuestions(
        cadastroFormName
      );
      let answersToAdd = [];

      for (let index = 0; index < questionsPage.length; index++) {
        const questions = questionsPage[index];

        for (let l = 0; l < questions.length; l++) {
          const question = questions[l];


          let answer = " ";


          let answers = [];
          answers = answers.concat(answer);

          if (answers.length == 0) {
            answers.push(" ");
          }

          for (const answ of answers) {
            let answerInfo = {
              CENTRO_ID: centro._id,
              QUIZ_ID: question.QUIZ_ID,
              QUESTION_ID: question._id,
              ANSWER: answ,
            };
            answersToAdd.push(answerInfo);
          }
        }
      }

      await this.trabalhocontroller.postQuizResponse(answersToAdd);
    } catch (error) {
      this.logger.error(`Insert Answers ${error}`);
      throw error;
    }
  }

  async checkUserWasInitialized(info) {
    let { centro_id } = info;

    let form = await this.trabalhocontroller.getFormByParams(
      this.parser.getParamsParsed({
        NAME: "Cadastro de Informações Anual",
      })
    );

    let firstQuestionId = form[0].PAGES[0].QUIZES[0].QUESTIONS[0].GROUP[0]._id;

    let answers = await this.trabalhocontroller.getQuizResponseByParams(
      this.parser.getParamsParsed({
        CENTRO_ID: centro_id,
        "QUESTION_ID._id": firstQuestionId,
      })
    );

    return answers.length > 0;
  }

  async getFormInfo(centro_id, form_alias, page) {
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
        page: page,
      },
      option: option,
    };
    const result = await this.searchcontroller.getPesquisaResult(pesquisaInfo);
    return result;
  }

  async initializeUserInfo(auth) {
    try {
      if (auth.scope_id) {
        return auth;
      }

      let userInfo = await this.getUserInfo(auth.loginHint);

      return userInfo;
    } catch (error) {
      this.logger.error(`initializeUserInfo ${error}`);
      throw error;
    }
  }

  async getUserInfo(info) {
    try {
      if (info.centro == "*") {
        if (info.regional == "*") {
          info.alianca = true;
        } else {
          const paramsParsed = this.parser.getParamsParsed({
            NOME_REGIONAL: decodeURIComponent(info.regional),
          });
          const regional = await this.regionalcontroller.getRegionalByParams(
            paramsParsed
          );
          info.scope_id = regional.ID;
        }
      } else {
        const paramsParsed = this.parser.getParamsParsed({
          NOME_CENTRO: decodeURIComponent(info.centro),
          NOME_CURTO: decodeURIComponent(info.curto),
          "REGIONAL.NOME_REGIONAL": decodeURIComponent(info.regional),
        });

        let centro = await this.regionalcontroller.getCentroByParam(
          paramsParsed
        );

        info.scope_id = centro.ID;
      }
      return info;
    } catch (error) {
      this.logger.error(`Error get user info ${error}`);
      throw error;
    }
  }
};
