const config = require("./helpers/config");

const Request = require("./helpers/request");
const request = new Request();



function initialize(){
  request.addInstance("aee_digital_regionais", config.aee_digital_regionais);
  request.addInstance("aee_digital_trabalhos", config.aee_digital_trabalhos);
}

module.exports = {
  initialize,
};
