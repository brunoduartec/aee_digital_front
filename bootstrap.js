const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
const config = require("./env.json")[env];

const logger = require("./helpers/logger");

const Request = require("./helpers/request");
const request = new Request();

const regionalController = require("./controllers/regional.controller");
const regionalcontroller = new regionalController();

const CentroInfoController = require("./controllers/centroInfo.controller");
const centroinfocontroller = new CentroInfoController();

const trabalhosController = require("./controllers/trabalhos.controller");
const trabalhoscontroller = new trabalhosController();

request.addInstance("aee_digital_regionais", config.aee_digital_regionais);
request.addInstance("aee_digital_trabalhos", config.aee_digital_trabalhos);

async function initialize() {
  await regionalcontroller.initialize();
  logger.info("Started regionalcontroller");
  await centroinfocontroller.initialize();
  logger.info("Started centroinfocontroller");
  await trabalhoscontroller.initialize();
  logger.info("Started trabalhoscontroller");
}

module.exports = {
  initialize,
};
