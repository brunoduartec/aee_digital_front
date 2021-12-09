module.exports = class UserInfoController {
  constructor(
    regionalcontroller,
    centroinfocontroller,
    trabalhocontroller,
    logger,
    parser
  ) {
    this.regionalcontroller = regionalcontroller;
    this.centroinfocontroller = centroinfocontroller;
    this.trabalhocontroller = trabalhocontroller;

    this.depara = require("../resources/de-para.json");

    this.quiz_cache = [];

    this.logger = logger;
    this.parser = parser;
  }

  getInfo(item, param) {
    let sub_params = param.split(".");
    if (sub_params.length > 1) {
      if (item[sub_params[0]]) {
        return item[sub_params[0]][sub_params[1]];
      } else return;
    } else {
      return item[param];
    }
  }

  async insertAnswers(centroInfo, centro_id) {
    for (let j = 0; j < this.depara.length; j++) {
      const depara_item = this.depara[j];

      if (!this.quiz_cache[depara_item.QUIZ]) {
        let paramsParsed = this.parser.getParamsParsed({
          CATEGORY: depara_item.QUIZ,
        });
        let template = await this.trabalhocontroller.getQuizTemplateByParams(
          paramsParsed
        );
        this.quiz_cache[depara_item.QUIZ] = template[0];
      }

      let question = await this.trabalhocontroller.getQuestionByParams(
        this.parser.getParamsParsed({
          QUESTION: depara_item.QUESTION,
        })
      );

      question = question[0];

      let answer = this.getInfo(centroInfo, depara_item.FROM);
      let answewrInfo = {
        CENTRO_ID: centro_id,
        QUIZ_ID: this.quiz_cache[depara_item.QUIZ].ID,
        QUESTION_ID: question.ID,
        ANSWER: answer,
      };

      console.log("===> ", answewrInfo);

      if (answer) {
        await this.trabalhocontroller.postQuizResponse(answewrInfo);
      }
    }
  }

  async initializeUserInfo(info) {
    const paramsParsed = this.parser.getParamsParsed({
      NOME_CENTRO: info.centro,
    });
    const centro = await this.regionalcontroller.getCentroByParam(paramsParsed);
    const centroInfo = await this.centroinfocontroller.getCentroInfo(
      centro.NOME_CURTO
    );

    await this.insertAnswers(centroInfo.centro, centro.ID);

    info.centro_id = centro.ID;

    info.initialized = true;

    return info;
  }
};
