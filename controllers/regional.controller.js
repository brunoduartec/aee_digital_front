const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";

const config = require("../env.json")[env];

const Request = require("../helpers/request");
const request = new Request();

const Logger = require("../helpers/logger");
const logger = new Logger();

module.exports = class regionalController {
  constructor() {}

  async getRegionais() {
    try {
      const regionals = await request.get(
        "aee_digital_regionais",
        `/regionais`
      );
      logger.info("getRegionais", regionals);
      return regionals;
    } catch (error) {
      logger.error("regional.controller.getRegionais: Error=>", error);
    }
  }

  async getCentrosByRegional(regionalName) {
    try {
      const centros = await request.get(
        "aee_digital_regionais",
        `/centros?REGIONAL.NOME_REGIONAL=${regionalName}`
      );
      logger.info("getCentrosByRegional", centros);
      return centros;
    } catch (error) {
      logger.error("regional.controller.getCentrosByRegional: Error=>", error);
      return null;
    }
  }

  async getCentros() {
    try {
      const centros = await request.get("aee_digital_regionais", `/centros`);
      logger.info("getCentros", centros);
      return centros;
    } catch (error) {
      logger.error("regional.controller.getCentros: Error=>", error);
      return null;
    }
  }

  async getCentroByID() {}

  async getCentroByParam(params) {
    try {
      const centro = await request.get(
        "aee_digital_regionais",
        `/centros?NOME_CURTO=${params.NOME_CURTO}`
      );
      logger.info("getCentroByParam", centro[0]);
      return centro[0];
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
