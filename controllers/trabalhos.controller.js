const { default: axios } = require("axios");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
const config = require("../env.json")[env];

module.exports = class trabalhosController {
  constructor() {}

  async getAtividades() {
    try {
      const atividades = await axios.get(`${config.aee_digital_trabalhos}/atividades`);
      console.log("atividades.controller.getAtividades: Success=>", atividades.data)      
      return atividades.data;
    } catch (error) {
      console.log("trabalhos.controller.getAtividades: Error=>", error)      
    }
  }

  async getAtividadesCentroByParams(params) {
    try {
      const atividades = await axios.get(`${config.aee_digital_trabalhos}/atividades_centro?${params}`);
      console.log("atividades.controller.getAtividades: Success=>", atividades.data)      
      return atividades.data;
    } catch (error) {
      console.log("trabalhos.controller.getAtividades: Error=>", error)      
    }
  }

};
