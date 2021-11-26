const makeDb = require("../db");
const makeModelGenericList = require("./model_generic-list");
const makeModelGenericEndpointHandler = require("./model_generic-endpoint");

let ModelFactory = require("../db/modelFactory");
const database = makeDb(ModelFactory);

module.exports = function makeGenericModel({ modelName }) {
  const modelGenericList = makeModelGenericList({
    database,
    modelName,
  });
  const modelGenericEndpointHandler = makeModelGenericEndpointHandler({
    modelGenericList,
    modelName,
  });

  return modelGenericEndpointHandler;
};
