module.exports = class CentroInfoController {
  constructor(logger, reader, parser) {
    this.logger = logger;

    this.reader = reader;
    this.groups = require("../resources/groups.json");
    this.permissions = require("../resources/permissions.json");
    
    this.parser = parser;

    this.cache = {};
  }

  async generatePassCache() {
    let objects = await this.reader.Read();

    for (let index = 0; index < objects.length; index++) {
      const row = objects[index];

      const centro = row.centro;

      if(!this.cache[centro.regional]){
        this.cache[centro.regional] = {}
      }

      if(!this.cache[centro.regional][centro.Name]){
        this.cache[centro.regional][centro.Name] = []
      }

      this.cache[centro.regional][centro.Name].push({
        centro: centro
      })
    }

    this.logger.info(`End generate centro cache`);
  }

  async getCentroInfo(regional, nome, nome_curto) {
    this.logger.info(`getCentroInfo: ${regional}: ${nome}: ${nome_curto}`);

    let centroInfoByName = this.cache[regional][nome];

    let centroInfo = centroInfoByName.find(m=>{
      return m.centro.short === nome_curto
    })

    return centroInfo;
  }
};
