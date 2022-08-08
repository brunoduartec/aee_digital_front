const config = require("../helpers/config");

module.exports = class CentroInfoController {
  constructor(
    logger = require("../helpers/logger"),
    Reader = require("../helpers/reader"),
    parser = require("../helpers/parser"),
    readXlsxFile = require("read-excel-file/node"),
    schema = require("../resources/centro_schema")()
  ) {
    const instance = this.constructor.instance;
    if (instance) {
      return instance;
    }

    this.logger = logger;
    this.parser = parser;

    let fileName = `./resources/${config.centros.base}.xlsx`;
    this.reader = new Reader(readXlsxFile, fileName, schema);

    this.constructor.instance = this;
  }

  async initialize() {
    this.groups = require("../resources/groups.json");
    this.permissions = require("../resources/permissions.json");

    this.cache = {};

    await this.generatePassCache();
  }

  async generatePassCache() {
    let objects = await this.reader.Read();

    for (let index = 0; index < objects.length; index++) {
      const row = objects[index];

      const centro = row.centro;

      if (!this.cache[centro.regional]) {
        this.cache[centro.regional] = {};
      }

      if (!this.cache[centro.regional][centro.Name]) {
        this.cache[centro.regional][centro.Name] = [];
      }

      this.cache[centro.regional][centro.Name].push({
        centro: centro,
      });
    }

    this.logger.info(
      `controller:centroinfo.controller:generatePassCache: End generate centro cache`
    );
  }

  async getCentroInfo(regional, nome, nome_curto) {
    try {
      // this.logger.info(
      //   `controller:centroinfo.controller:getCentroInfo: ${regional}: ${nome}: ${nome_curto}`
      // );

      let centroInfoByName = this.cache[regional][nome];

      let centroInfo = centroInfoByName.find((m) => {
        return m.centro.short === nome_curto;
      });

      return centroInfo;
    } catch (error) {
      this.logger.error(
        `controller:centroinfo.controller:getCentroInfo: Error getCentroInfo: ${error}`
      );
      throw error;
    }
  }
};
