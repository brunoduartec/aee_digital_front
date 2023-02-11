/* eslint-disable no-undef */
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
const config = require("../env.json")[env];

module.exports = config;
