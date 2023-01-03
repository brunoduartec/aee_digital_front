const IController = require("./icontroller");

module.exports = class regionalController extends IController {
  constructor(
    Request = require("../helpers/request"),
    xlsReader = require("read-excel-file/node")
  ) {
    super("regionais")

    this.request = new Request();
    this.xlsReader = xlsReader;
  }

  async initialize() {
    try {
      const formatedKey = this.getKeyFormated(`initialized`)
      const initialized = await this.cache.get(formatedKey)
      if(!initialized){
        await this.generateInfoByCache(this.xlsReader);
      }
    } catch (error) {
      throw new Error(error)
    }

  }

  async generateInfoByCache(xlsReader) {
    await this.getCentros();
  }

  async getRegionais() {
    try {
      const formatedKey = this.getKeyFormated(`regionais`)
      const regionais = await this.cache.get(formatedKey)
      if (regionais) {
        return regionais;
      } else {
        const regionals = await this.request.get(
          "aee_digital_regionais",
          `/regionais`
        );
        // this.logger.info(
        //   `controller:regional.controller:getRegionais: ${regionals}`
        // );

        this.cache.set(formatedKey, regionais)
        return regionals;
      }
    } catch (error) {
      this.logger.error(`regional.controller.getRegionais: Error=>: ${error}`);
      throw error;
    }
  }

  async getRegionalByParams(params) {
    try {
      const formatedKey = this.getKeyFormated(`regionais:${params}`)
    const regional = await this.cache.get(formatedKey)
    if(regional) {return regional}
    else{
      let regional = await this.request.get(
        "aee_digital_regionais",
        `/regionais?${params}`
      );
      // this.logger.info(
      //   `controller:regional.controller:getRegionalByParams: ${regional[0]}`
      // );

      regional = regional[0];
      this.cache.set(formatedKey, regional)

      return regional;
    }
    } catch (error) {
      this.logger.error(
        `regional.controller.getRegionalByParams: Error=> ${error}`
      );
      throw error;
    }
  }

  async getCentrosByRegional(regionalName) {
    try {
      const formatedKey = this.getKeyFormated(`centros:${regionalName}`)
      const centros = await this.cache.get(formatedKey)

      if(centros){
        return centros
      }else{
        const centros = await this.request.get(
          "aee_digital_regionais",
          `/centros?REGIONAL.NOME_REGIONAL=${regionalName}`
        );
        // this.logger.info(
        //   `controller:regional.controller:getCentrosByRegional: ${centros}`
        // );

        this.cache.set(formatedKey, centros)
  
        return centros;

      }


    } catch (error) {
      this.logger.error(
        `regional.controller.getCentrosByRegional: Error=>${error}`
      );
      throw error;
    }
  }

  async getCentros() {
    try {
      const formatedKey = this.getKeyFormated(`centros`)
      const centros = await this.cache.get(formatedKey)
  
      if(centros){
        return centros
      }else{
        const centros = await this.request.get(
          "aee_digital_regionais",
          `/centros`
        );
        // this.logger.info(
        //   `controller:regional.controller:getCentros: ${JSON.stringify(centros)}`
        // );

        this.cache.set(formatedKey,centros)
        return centros;

      }
      
    } catch (error) {
      this.logger.error(`regional.controller.getCentros: Error=> ${error}`);
      throw error;
    }
  }

  async getCentroByParam(params) {
    try {
      const formatedKey = this.getKeyFormated(`centros:${params}`)
      const centro = await this.cache.get(formatedKey)

      if(centro){
        return centro
      }
      else{
        let centro = await this.request.get(
          "aee_digital_regionais",
          `/centros?${params}`
        );
        
        centro = centro[0];

        this.cache.set(formatedKey, centro)
  
        return centro;

      }

    } catch (error) {
      this.logger.error(
        `controller:regional.controller:getCentroByParam: Error=> ${error}`
      );
      throw error;
    }
  }
 
};
