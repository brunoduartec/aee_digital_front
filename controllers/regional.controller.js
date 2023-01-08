module.exports = class regionalController {
  constructor(
    logger = require("../helpers/logger"),
    Request = require("../helpers/request")
  ) {
    const instance = this.constructor.instance;
    if (instance) {
      return instance;
    }

    this.logger = logger;
    this.request = new Request();
    this.cache = {};

    this.constructor.instance = this;
  }

  async initialize() {
    await this.generateInfoByCache(this.xlsReader);
  }

  async generateInfoByCache(xlsReader) {

    let centros = await this.getCentros();
    this.cache.centros = centros;

   
  }

  getCentrosByCache() {
    return this.cache.centros;
  }

  getCentroByCacheByRegional(regionalName) {
    let centros = this.cache.centros.filter((m) => {
      return m.REGIONAL.NOME_REGIONAL === regionalName;
    });
    return centros;
  }

  getCentroByCacheByID(centroId) {
    const centros = this.getCentrosByCache();
    const centro = centros.find((m) => {
      return m._id === centroId;
    });

    return centro;
  }

  async getRegionais() {
    try {
      if (this.cache.regionais) {
        return this.cache.regionais;
      } else {
        const regionals = await this.request.get(
          "aee_digital_regionais",
          `/regionais`
        );
        // this.logger.info(
        //   `controller:regional.controller:getRegionais: ${regionals}`
        // );

        this.cache.regionais = regionals;
        return regionals;
      }
    } catch (error) {
      this.logger.error(`regional.controller.getRegionais: Error=>: ${error}`);
      throw error;
    }
  }

  async getRegionalByParams(params) {
    try {
      const regional = await this.request.get(
        "aee_digital_regionais",
        `/regionais?${params}`
      );
      // this.logger.info(
      //   `controller:regional.controller:getRegionalByParams: ${regional[0]}`
      // );

      return regional[0];
    } catch (error) {
      this.logger.error(
        `regional.controller.getRegionalByParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async getCentrosByRegional(regionalName) {
    try {
      const centros = await this.request.get(
        "aee_digital_regionais",
        `/centros?REGIONAL.NOME_REGIONAL=${regionalName}`
      );
      // this.logger.info(
      //   `controller:regional.controller:getCentrosByRegional: ${centros}`
      // );

      return centros;
    } catch (error) {
      this.logger.error(
        `regional.controller.getCentrosByRegional: Error=>${error}`
      );
      throw error;
    }
  }

  async getCentros() {
    try {
      if(this.cache.centros){
        return this.cache.centros;
      }else{
        const centros = await this.request.get(
          "aee_digital_regionais",
          `/centros`
        );
        // this.logger.info(
        //   `controller:regional.controller:getCentros: ${JSON.stringify(centros)}`
        // );

        this.cache.centros = centros;
        return centros;

      }
    } catch (error) {
      this.logger.error(`regional.controller.getCentros: Error=> ${error}`);
      throw error;
    }
  }

  async getCentroByParam(params) {
    try {
      const centro = await this.request.get(
        "aee_digital_regionais",
        `/centros?${params}`
      );
      // this.logger.info(
      //   `controller:regional.controller:getCentroByParam ${centro[0]}`
      // );

      return centro[0];
    } catch (error) {
      this.logger.error(
        `controller:regional.controller:getCentroByParam: Error=> ${error}`
      );
      throw error;
    }
  }

  async updateCentro(centroInfo) {
    try {
      const nome_curto = centroInfo.NOME_CURTO;
      const centros = await this.request.get(
        "aee_digital_regionais",
        `/centros?NOME_CURTO=${nome_curto}`,
        centroInfo
      );
      // this.logger.info(
      //   `controller:regional.controller:updateCentro: ${centros}`
      // );
      return centros;
    } catch (error) {
      this.logger.error(
        `controller:regional.controller:updateCentro: Error=> ${error}`
      );
      throw error;
    }
  }
};
