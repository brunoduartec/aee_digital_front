module.exports = class UserInfoController {
  constructor(
    RegionaisController = require("./regional.controller"),
    TrabalhosController = require("./trabalhos.controller"),
    SearchController = require("./search.controller"),
    logger = require("../helpers/logger"),
    parser = require("../helpers/parser")
  ) {
    this.regionalcontroller = new RegionaisController();
    this.trabalhocontroller = new TrabalhosController();
    this.searchcontroller = new SearchController();
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


  async getFormInfo(centro_id, form_alias, page) {
    const pesquisaInfo = {
      search: {
        id: centro_id,
        name: form_alias,
        page: page,
      },
      option: "Quiz",
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
          info.scope_id = regional._id;
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

        info.scope_id = centro._id;
      }
      return info;
    } catch (error) {
      this.logger.error(`Error get user info ${error}`);
      throw error;
    }
  }
};
