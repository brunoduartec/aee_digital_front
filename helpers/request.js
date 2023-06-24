const axios = require("axios");
const polly = require("polly-js")

module.exports = class Request {
  constructor(logger = require("../helpers/logger")) {
    const instance = this.constructor.instance;
    if (instance) {
      return instance;
    }

    this.logger = logger;
    this.constructor.instance = this;

    this.base = "/api/v1";
    this.instances = {};
  }

  addInstance(name, host) {
    this.instances[name] = host;
  }

  async executeMethodWithRetry(method, url, retries=2){
    return polly()
    .waitAndRetry(retries)
    .executeForPromise(async () => {
      const response = await axios[method](url)
      if (!response.error) {
        return response;
      }else{
        return Promise.reject(response.error);
      }
    });
  }

  async get(instanceName, route) {
    try {
      const response = await this.executeMethodWithRetry("get",encodeURI(`${this.instances[instanceName]}${this.base}${route}`))
      return response.data;
    } catch (error) {
      this.logger.error(`helpers:request:get => ${error}`);
      throw error;
    }
  }

  async post(instanceName, route, body) {
    try {
      const response = await axios.post(
        encodeURI(`${this.instances[instanceName]}${this.base}${route}`),
        body
      );
      // this.logger.info(`helpers:request:post ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`helpers:request:post ${error}`);
      throw error;
    }
  }

  async put(instanceName, route, body) {
    try {
      const response = await axios.put(
        decodeURIComponent(
          `${this.instances[instanceName]}${this.base}${route}`
        ),
        body
      );
      // this.logger.info(`helpers:request:put  ${response.data}`);
      return response.data;
    } catch (error) {
      this.logger.error(`helpers:request:put ${error}`);
      throw error;
    }
  }

  async delete(instanceName, route) {
    try {
      const response = await axios.delete(
        decodeURIComponent(
          `${this.instances[instanceName]}${this.base}${route}`
        )
      );
      // this.logger.info(`helpers:request:delete ${response.data}`);
      return response.data;
    } catch (error) {
      this.logger.error(`helpers:request:delete ${error}`);
      throw error;
    }
  }
};
