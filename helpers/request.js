const axios = require("axios");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";

const config = require("../env.json")[env];

const Logger = require("./logger");
const logger = new Logger();

module.exports = class Request {
  constructor() {
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
      const response = await axios.get(
        `${this.instances[instanceName]}${this.base}${route}`
      );
      logger.info("request:get", response.data);
      return response.data;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async post(instanceName, route, body) {
    try {
      const response = await axios.post(
        `${this.instances[instanceName]}${this.base}${route}`,
        body
      );
      logger.info("request:post", response.data);
      return response.data;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async put(instanceName, route, body) {
    try {
      const response = await axios.put(
        `${this.instances[instanceName]}${this.base}${route}`,
        body
      );
      logger.info("request:put", response.data);
      return response.data;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async delete(instanceName, route) {
    try {
      const response = await axios.delete(
        `${this.instances[instanceName]}${this.base}${route}`
      );
      logger.info("request:delete", response.data);
      return response.data;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
};
