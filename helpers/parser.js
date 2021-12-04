const Logger = require("../helpers/logger");
const logger = new Logger();

function getParamsParsed(params) {
  let paramsParsed = "";

  let keys = Object.keys(params);

  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    const value = params[key];

    if (value) {
      paramsParsed = paramsParsed.concat(`&${key}=${value}`);
    }
  }

  logger.info("getParamsParsed", paramsParsed.substring(1));

  return paramsParsed.substring(1);
}

module.exports = {
  getParamsParsed,
};
