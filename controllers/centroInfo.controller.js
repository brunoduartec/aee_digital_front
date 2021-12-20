module.exports = class CentroInfoController {
  constructor(logger, reader, parser) {
    this.logger = logger;

    this.xlsReader = reader;
    this.groups = require("../resources/groups.json");
    this.permissions = require("../resources/permissions.json");
    this.fileName = "./resources/Cadastro_2021.xlsx";
    this.parser = parser;

    this.cache = {};
  }

  async generatePassCache() {
    const schema = require("../resources/centro_schema")();
    let excel = await this.xlsReader(this.fileName, { schema });
    let objects = excel.rows;

    for (let index = 0; index < objects.length; index++) {
      const row = objects[index];

      const centro = row.centro;

      if(!this.cache[centro.regional]){
        this.cache[centro.regional] = {}
      }

      this.cache[centro.regional][centro.Name] = {
        centro: centro,
      };
    }

    this.logger.info("End generate centro cache");
  }

  async getCentroInfo(regional, nome) {
    this.logger.info(regional, nome);
    return this.cache[regional][nome];
  }
};
