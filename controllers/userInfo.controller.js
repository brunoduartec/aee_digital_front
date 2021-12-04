module.exports = class UserInfoController {
  constructor(regionalcontroller, logger, parser) {
    this.regionalcontroller = regionalcontroller;
    this.logger = logger;
    this.parser = parser;
  }

  async initializeUserInfo(info) {
    const paramsParsed = this.parser.getParamsParsed({
      NOME_CENTRO: info.centro,
      // "REGIONAL.NOME_REGIONAL": info.regional,
    });
    const centro = await this.regionalcontroller.getCentroByParam(paramsParsed);

    info.centro_id = centro.ID;

    info.initialized = true;

    return info;
  }
};
