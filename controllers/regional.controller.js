const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";

const config = require("../env.json")[env];

const Request = require("../helpers/request");
const request = new Request();

const Logger = require("../helpers/logger");
const logger = new Logger();

module.exports = class regionalController {
  constructor() {

    this.cache={}
  }

  async getRegionais() {
    try {
      if(this.cache.getRegionais){
        logger.info("getRegionais by cache", this.cache.getRegionais);
        return this.cache.getRegionais
      }else{
        const regionals = await request.get(
          "aee_digital_regionais",
          `/regionais`
        );
        logger.info("getRegionais", regionals);
  
        this.cache.getRegionais = regionals;
        return regionals;
      }
    } catch (error) {
      logger.error("regional.controller.getRegionais: Error=>", error);
    }
  }

  async getRegionalByParams(params) {
    try {
      if(this.cache.getRegionalByParams && this.cache.getRegionalByParams[params]){
        logger.info("getRegionalByParams by cache", this.cache.getRegionalByParams[params]);
        return this.cache.getRegionalByParams[params]
      }
      else{
        const regional = await request.get(
          "aee_digital_regionais",
          `/regionais?${params}`
        );
        logger.info("getRegionalByParams", regional[0]);

        if(!this.cache.getRegionalByParams){
          this.cache.getRegionalByParams = {}
        }

        this.cache.getRegionalByParams[params] = regional[0];

        return regional[0];

      }
    } catch (error) {
      logger.error("regional.controller.getRegionalByParams: Error=>", error);
      return null;
    }
  }

  async getCentrosByRegional(regionalName) {
    try {
      if(this.cache.getCentrosByRegional && this.cache.getCentrosByRegional[regionalName]){
        logger.info("getCentrosByRegional by cache", this.cache.getCentrosByRegional[regionalName]);
        return this.cache.getCentrosByRegional[regionalName]
      }else{
        const centros = await request.get(
          "aee_digital_regionais",
          `/centros?REGIONAL.NOME_REGIONAL=${regionalName}`
        );
        logger.info("getCentrosByRegional", centros);
  
        if(!this.cache.getCentrosByRegional){
          this.cache.getCentrosByRegional = {}
        }
        this.cache.getCentrosByRegional[regionalName] = centros;
        return centros;
      }
    } catch (error) {
      logger.error("regional.controller.getCentrosByRegional: Error=>", error);
      return null;
    }
  }

  async getCentros() {
    try {
      if(this.cache.getCentros){
        logger.info("getCentros by cache", this.cache.getCentros);
        return this.cache.getCentros;
      }else{
        const centros = await request.get("aee_digital_regionais", `/centros`);
        logger.info("getCentros", centros);
        this.cache.getCentros = centros;
        return centros;
      }
    } catch (error) {
      logger.error("regional.controller.getCentros: Error=>", error);
      return null;
    }
  }

  async getCentroByParam(params) {
    try {
      if(this.cache.getCentroByParam && this.cache.getCentroByParam[params]){
        logger.info("getCentroByParam by cache", this.cache.getCentroByParam[params]);
        return this.cache.getCentroByParam[params]
      }else{
        const centro = await request.get(
          "aee_digital_regionais",
          `/centros?${params}`
        );
        logger.info("getCentroByParam", centro[0]);

        if(!this.cache.getCentroByParam){
          this.cache.getCentroByParam = {}
        }

        this.cache.getCentroByParam[params] = centro[0];
        return centro[0];
      }
    } catch (error) {
      logger.error("regional.controller.getCentros: Error=>", error);
      return null;
    }
  }

  async updateCentro(centroInfo) {
    try {
      const nome_curto = centroInfo.NOME_CURTO;
      const centros = await request.get(
        "aee_digital_regionais",
        `/centros?NOME_CURTO=${nome_curto}`,
        centroInfo
      );
      logger.info("updateCentro", centros);
      return centros;
    } catch (error) {
      logger.error("regional.controller.updateCentro: Error=>", error);
      return null;
    }
  }
};
