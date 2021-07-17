const { default: axios } = require("axios");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
const config = require("../env.json")[env];

module.exports = class regionalController {
  constructor() {}

  async getRegionais() {
    console.log("CONFIG->",config.aee_digital_regionais)
    const regionals = await axios.get(`${config.aee_digital_regionais}/regionais`);
    return regionals.data;
  }

  async getCentrosByRegional(regionalName) {
    console.log("CONFIG->",config.aee_digital_regionais)
    const regionals = await axios.get(`${config.aee_digital_regionais}/regionais`);
    return regionals.data;
  }

  async getCentros() {
    const centro = await axios.get(`${config.aee_digital_regionais}/centros`);
    return centro.data;
  }

  async getCentroByID() {}

  async getCentroByParam(params) {
    console.log()
    const centro = await axios.get(`${config.aee_digital_regionais}/centros?NOME_CURTO=${params.NOME_CURTO}`);
    return centro.data[0];
  }
};
