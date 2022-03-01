const axios = require("axios");

module.exports = class Request {
  constructor(logger) {
    this.logger = logger
    const instance = this.constructor.instance;
    if (instance) {
      return instance;
    }

    this.constructor.instance = this;

    this.base = "/api/v1";
    this.instances = {};
  }

  addInstance(name, host) {
    this.instances[name] = host;
  }

  async get(instanceName, route) {
    try {
      const response = await axios.get(encodeURI(`${this.instances[instanceName]}${this.base}${route}`)
      );
      this.logger.info(`request:get ${response.data}`);
      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async post(instanceName, route, body) {
    try {
      const response = await axios.post(encodeURI(`${this.instances[instanceName]}${this.base}${route}`),
        body
      );
      this.logger.info(`request:post ${response.data}`);
      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async put(instanceName, route, body) {
    try {
      const response = await axios.put(
        decodeURIComponent(`${this.instances[instanceName]}${this.base}${route}`),
        body
      );
      this.logger.info(`request:put  ${response.data}`);
      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async delete(instanceName, route) {
    try {
      const response = await axios.delete(
        decodeURIComponent(`${this.instances[instanceName]}${this.base}${route}`)
      );
      this.logger.info(`request:delete ${response.data}`);
      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
};
