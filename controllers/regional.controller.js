const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";

const config = require("../env.json")[env];

const Request = require("../helpers/request");
const request = new Request();

const Logger = require("../helpers/logger");
const logger = new Logger();

module.exports = class regionalController {
  constructor() {
    this.cache = {}
  }

  async generateInfoByCache(xlsReader) {
    const schema = require("../resources/schema")();
    const fileName = `./resources/Senhas_v2.xlsx`;
    let excel = await xlsReader(fileName, {
      schema
    });
    let objects = excel.rows;

    let centros = await this.getCentros();
    this.cache.centros = [];

    for (const object of objects) {
      const centro = object.centro;
      let centroInfo = centros.find(m=>{
        return m.NOME_CENTRO === centro.nome && m.NOME_CURTO === centro.curto && m.REGIONAL.NOME_REGIONAL === centro.regional;
      })
   
      if(centroInfo){
        this.cache.centros.push(centroInfo)
      }
   
    }

    console.log("Centros cached")
  }

  getCentrosByCache(){
    return this.cache.centros
  }

  getCentroByCacheByRegional(regionalName){
    return this.cache.centro.filter(m=>{
      return m.regional === regionalName
    })
  }

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

  async getRegionalByParams(params) {
    try {
      const regional = await request.get(
        "aee_digital_regionais",
        `/regionais?${params}`
      );
      logger.info("getRegionalByParams", regional[0]);

      return regional[0];

    } catch (error) {
      logger.error("regional.controller.getRegionalByParams: Error=>", error);
      return null;
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

  async getCentroByParam(params) {
    try {
      const centro = await request.get(
        "aee_digital_regionais",
        `/centros?${params}`
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