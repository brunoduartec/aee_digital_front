module.exports = class UserInfoController {
  constructor(
    Controller = require("./api.controller"),
    SearchController = require("./search.controller"),
    logger = require("../helpers/logger"),
    parser = require("../helpers/parser")
  ) {
    this.controller = new Controller();
    this.searchcontroller = new SearchController();
    this.depara = require("../resources/de-para.json");

    this.logger = logger;
    this.parser = parser;
  }

  async getFormInfo(centro_id, form_alias, page, user_role) {
    try {
      const pesquisaInfo = {
        search: {
          id: centro_id,
          name: form_alias,
          page: page,
        },
        option: "Quiz",
        user_role
      };
      const result = await this.searchcontroller.getPesquisaResult(pesquisaInfo);
      return result;
      
    } catch (error) {
      this.logger.error(error)
      throw(error)
      
    }
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
          const regional = await this.controller.getRegionalByParams(
            paramsParsed
          );
          info.scope_id = regional._id;
        }
      } else {
        const paramsParsed = this.parser.getParamsParsed({
          NOME_CENTRO: decodeURIComponent(info.centro),
          NOME_CURTO: decodeURIComponent(info.curto),
          "REGIONAL.NOME_REGIONAL": decodeURIComponent(info.regional),
        });

        let centro = await this.controller.getCentroByParam(
          paramsParsed
        );

        info.scope_id = centro._id;
      }
      return info;
    } catch (error) {
      this.logger.error(`Error get user info ${error}`);
      throw error;
    }
  }
};
