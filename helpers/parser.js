const logger = require("../helpers/logger");

function getNestedObject(nestedObj, pathArr) {
  const response = pathArr.reduce(
    (obj, key) => (obj && obj[key] !== "undefined" ? obj[key] : undefined),
    nestedObj
  );
  
  return response
}

function getParamsParsed(params) {
  let paramsParsed = "";

  let keys = Object.keys(params);

  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    const value = params[key];

    if (value) {
      paramsParsed = paramsParsed.concat(
        `&${key}=${decodeURIComponent(value)}`
      );
    }
  }

  // logger.info(`helpers:parser:getParamsParsed => ${paramsParsed.substring(1)}`);

  return paramsParsed.substring(1);
}

function getQueryParamsParsed(query) {
  let removeInterrogation = query.split("?")
  let info

  if(removeInterrogation.length>1){
    info = removeInterrogation[1].split("&");
  }else{
    info = query.split("&")
  }
  
  let paramsParsed = {};

  for (let i = 0; i < info.length; i++) {
    const element = info[i];
    const parsed = element.split("=");
    paramsParsed[parsed[0]] = decodeURIComponent(parsed[1]);
  }

  if (paramsParsed.answerId && paramsParsed.answerId.includes("_")) {
    let ansparsed = paramsParsed.answerId.split("_");
    paramsParsed.answerId = ansparsed[0];
    let option = ansparsed[1];
    if (option == "1") {
      paramsParsed.answer = true;
    } else {
      paramsParsed.answer = false;
    }
  }

  return paramsParsed;
}

module.exports = {
  getParamsParsed,
  getQueryParamsParsed,
  getNestedObject,
};
