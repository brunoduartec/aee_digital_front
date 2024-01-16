const config = require("./helpers/config");

const Request = require("./helpers/request");
const request = new Request();



function initialize(){
  request.addInstance("aee_digital_api", config.aee_digital_api);
}

module.exports = {
  initialize,
};
