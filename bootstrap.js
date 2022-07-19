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

function initcontroller(controller) {
  return new Promise((resolve, reject) => {
    try {
      controller.initialize();
      resolve();
    } catch (error) {
      reject();
    }
  });
}

const promises = [];

promises.push(initcontroller(regionalcontroller));
promises.push(initcontroller(centroinfocontroller));
promises.push(initcontroller(trabalhoscontroller));

async function initialize() {
  await Promise.all(promises)
    .then((m) => {
      logger.info(`Bootstrap: ${m}`);
    })
    .catch((error) => {
      logger.error(`Bootstrap: ${error}`);
    });
}

module.exports = {
  initialize,
};
