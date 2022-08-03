/* eslint-disable no-undef */
const logger = require("./logger");
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
logger.info(`ENVIRONMENT=> ${env}`);
const config = require("../env.json")[env];

module.exports = config;
