const dns = require("dns");
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";

const config = require("../env.json")[env];

const Logger = require("./logger");
const logger = new Logger();

module.exports = class Request {
  constructor() {
    if (this.instances.constructor) {
      return this.instances.constructor;
    }

    this.instances = {};
    this.instances.constructor = this;
  }

  addInstance(name, host) {
    this.instances[name] = axios.create({
      baseURL: `${host}`,
    });
  }

  async get(instanceName, route) {
    try {
      const response = await this.instances[instanceName].get(route);
      logger.info("request:get", response.data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async post(instanceName, route, body) {
    try {
      const response = await this.instances[instanceName].post(route, body);
      logger.info("request:post", response.data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
};
