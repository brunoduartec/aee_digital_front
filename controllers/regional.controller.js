const CacheableController = require("./cacheable.controller")

module.exports = class regionalController extends CacheableController{
  constructor(
  ) {
    super({
      service: "aee_digital_regionais"
    })
    
  }


  async getRegionais() {
    return await this.get('regionais')
  }

  async getRegionalByParams(params) {
    return await this.get('regionais', params)
  }

  async getCentros() {
    return await this.get('centros')
  }

  async getCentroByParam(params) {
    return await this.get('centros', params)
  }

  async updateCentro(params, value) {
    return await this.put('centros', params, value)
  }
};
