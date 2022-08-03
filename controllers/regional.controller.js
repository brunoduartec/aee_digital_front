module.exports = class regionalController {
  constructor(
    logger = require("../helpers/logger"),
    Request = require("../helpers/request"),
    xlsReader = require("read-excel-file/node")
  ) {
    const instance = this.constructor.instance;
    if (instance) {
      return instance;
    }

    this.logger = logger;
    this.request = new Request();
    this.xlsReader = xlsReader;
    this.cache = {};

    this.constructor.instance = this;
  }

  async initialize() {
    await this.generateInfoByCache(this.xlsReader);
  }

  async generateInfoByCache(xlsReader) {
    const schema = require("../resources/schema")();
    const fileName = `./resources/Senhas_v2.xlsx`;
    let excel = await xlsReader(fileName, {
      schema,
    });
    let objects = excel.rows;

    objects = objects.filter((m) => {
      return m.centro.nome != "*";
    });

    let centros = await this.getCentros();
    this.cache.centros = [];
    this.naoencontrado = [];

    for (const object of objects) {
      const centro = object.centro;
      let centroInfo = centros.find((m) => {
        return (
          m.NOME_CURTO === centro.curto &&
          m.REGIONAL.NOME_REGIONAL === centro.regional &&
          m.NOME_CENTRO === centro.nome
        );
      });

      if (centroInfo) {
        this.cache.centros.push(centroInfo);
      } else {
        this.naoencontrado.push(centro);
        this.logger.info(
          `generateInfoByCache-> Não encontrado: ${JSON.stringify(centro)}`
        );
      }
    }

    this.logger.info(`Centros cached: ${JSON.stringify(this.cache.centros)}`);
    this.logger.info(
      `Centros nao encontrados: ${JSON.stringify(this.naoencontrado)}`
    );
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
      return m.ID === centroId;
    });

    return centro;
  }

  async getRegionais() {
    try {
      if (this.cache.regionais) {
        return this.cache.getRegionais;
      } else {
        const regionals = await this.request.get(
          "aee_digital_regionais",
          `/regionais`
        );
        this.logger.info(`getRegionais: ${regionals}`);

        this.cache.getRegionais = regionals;
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
      this.logger.info(`getRegionalByParams: ${regional[0]}`);

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
      this.logger.info(`getCentrosByRegional: ${centros}`);

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
      const centros = await this.request.get(
        "aee_digital_regionais",
        `/centros`
      );
      this.logger.info(`getCentros: ${JSON.stringify(centros)}`);
      return centros;
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
      this.logger.info(`getCentroByParam ${centro[0]}`);

      return centro[0];
    } catch (error) {
      this.logger.error(`regional.controller.getCentros: Error=> ${error}`);
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
      this.logger.info(`updateCentro: ${centros}`);
      return centros;
    } catch (error) {
      this.logger.error(`regional.controller.updateCentro: Error=> ${error}`);
      throw error;
    }
  }
};
