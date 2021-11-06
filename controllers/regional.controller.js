const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";

const config = require("../env.json")[env];

const Request = require("../helpers/request");
const request = new Request();

module.exports = class regionalController {
  constructor() {}

  async getRegionais() {
    try {
      const regionals = await request.get(
        "aee_digital_regionais",
        `/regionais`
      );

      return regionals.data;
    } catch (error) {
      console.log("regional.controller.getRegionais: Error=>", error);
    }
  }

  async getCentrosByRegional(regionalName) {
    try {
      const centros = await request.get(
        "aee_digital_regionais",
        `/centros?REGIONAL.NOME_REGIONAL=${regionalName}`
      );

      return centros.data;
    } catch (error) {
      console.log("regional.controller.getCentrosByRegional: Error=>", error);
      return null;
    }
  }

  async getCentros() {
    try {
      const centros = await request.get("aee_digital_regionais", `/centros`);

      return centros.data;
    } catch (error) {
      console.log("regional.controller.getCentros: Error=>", error);
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
      return centro.data[0];
    } catch (error) {
      console.log("regional.controller.getCentros: Error=>", error);
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

      return centros.data;
    } catch (error) {
      console.log("regional.controller.updateCentro: Error=>", error);
      return null;
    }
  }
};
