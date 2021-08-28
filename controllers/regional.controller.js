const { default: axios } = require("axios");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";

const config = require("../env.json")[env];

module.exports = class regionalController {
  constructor() {}

  async getRegionais() {
    try {
      const regionals = await axios.get(
        `${config.aee_digital_regionais}/regionais`
      );
      console.log(
        "regional.controller.getRegionais: Success=>",
        regionals.data
      );
      return regionals.data;
    } catch (error) {
      console.log("regional.controller.getRegionais: Error=>", error);
    }
  }

  async getCentrosByRegional(regionalName) {
    try {
      const centros = await axios.get(
        `${config.aee_digital_regionais}/centros?REGIONAL.NOME_REGIONAL=${regionalName}`
      );
      console.log(
        "regional.controller.getCentrosByRegional: Success=>",
        centros.data
      );
      return centros.data;
    } catch (error) {
      console.log("regional.controller.getCentrosByRegional: Error=>", error);
      return null;
    }
  }

  async getCentros() {
    try {
      const centros = await axios.get(
        `${config.aee_digital_regionais}/centros`
      );
      console.log("regional.controller.getCentros: Success=>", centros.data);
      return centros.data;
    } catch (error) {
      console.log("regional.controller.getCentros: Error=>", error);
      return null;
    }
  }

  async getCentroByID() {}

  async getCentroByParam(params) {
    try {
      const centro = await axios.get(
        `${config.aee_digital_regionais}/centros?NOME_CURTO=${params.NOME_CURTO}`
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
      const centros = await axios.get(
        `${config.aee_digital_regionais}/centros?NOME_CURTO=${nome_curto}`,
        centroInfo
      );
      console.log("regional.controller.updateCentro: Success=>", centros.data);
      return centros.data;
    } catch (error) {
      console.log("regional.controller.updateCentro: Error=>", error);
      return null;
    }
  }
};
