const CacheableController = require("./cacheable.controller")

module.exports = class regionalController extends CacheableController{
  constructor(
  ) {
    super({
      service: "aee_digital_regionais"
    })
    
  }


  async getRegionais() {
    try {
      return await this.get('regionais')
    } catch (error) {
      throw error
    }
  }

  async getRegionalByParams(params) {
    try {
      return await this.get('regionais', params)
    } catch (error) {
      throw error      
    }
  }

  async getCentros() {
    try {
      return await this.get('centros')
    } catch (error) {
        throw error      
    }
  }

  async getCentroByParam(params) {
    try {
      return await this.get('centros', params)
      
    } catch (error) {
      throw error
    }
  }

  async updateCentro(params, value) {
    try {
      return await this.put('centros', params, value)
      
    } catch (error) {
      throw error
    }
  }
};
