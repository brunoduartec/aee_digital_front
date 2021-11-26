const makeGeneric = require("./model_generic_entity");

const {
  UniqueConstraintError,
  InvalidPropertyError,
  RequiredParameterError,
} = require("../helpers/errors");
const makeHttpError = require("../helpers/http-error");

module.exports = function makeModelGenericEndpointHandler({
  modelGenericList,
  modelName,
}) {
  return async function handle(httpRequest) {
    switch (httpRequest.method) {
      case "POST":
        return post(httpRequest);
        break;
      case "GET":
        return get(httpRequest);
        break;
      case "DELETE":
        return remove(httpRequest);
        break;
      case "PUT":
        return update(httpRequest);
        break;

      default:
        let errorMessage = `${httpRequest.method} method not allowed.`;
        console.log(errorMessage);

        return makeHttpError({
          statusCode: 405,
          errorMessage: errorMessage,
        });
        break;
    }
  };

  function formatSearchParam(id, params) {
    let searchParams;
    if (id) {
      searchParams = {
        id: id,
      };
    } else if (Object.keys(params).length > 0) {
      searchParams = params;
    }

    return searchParams;
  }

  async function get(httpRequest) {
    const { id } = httpRequest.pathParams || {};
    const { max, ...params } = httpRequest.queryParams || {};

    let searchParams = formatSearchParam(id, params);
    let hasParams = searchParams != null;
    let result = [];

    if (hasParams) {
      result = await modelGenericList.findByItems({
        max,
        searchParams,
      });
    } else {
      result = await modelGenericList.getItems({
        max,
      });
    }

    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 200,
      data: JSON.stringify(result),
    };
  }

  async function post(httpRequest) {
    let model_genericInfo = httpRequest.body;
    if (!model_genericInfo) {
      return makeHttpError({
        statusCode: 400,
        errorMessage: "Bad request. No POST body",
      });
    }

    if (typeof httpRequest.body == "string") {
      try {
        model_genericInfo = JSON.parse(model_genericInfo);
      } catch {
        return makeHttpError({
          statusCode: 400,
          errorMessage: "Bad request. POST body must be valid JSON.",
        });
      }
    }

    try {

      let results = []
      let entries = [];
      if(Array.isArray(model_genericInfo)){
        entries = model_genericInfo
      }
      else{
        entries.push(model_genericInfo);
      }


      for (let index = 0; index < entries.length; index++) {
        const entry = entries[index];
        const itemAdded = await modelGenericList.add(entry);
        const result = makeGeneric(itemAdded, modelName);
        results.push(result);
      }
      return {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: 201,
        data: JSON.stringify(results),
      };
    } catch (e) {
      return makeHttpError({
        errorMessage: e.message,
        statusCode:
          e instanceof UniqueConstraintError
            ? 409
            : e instanceof InvalidPropertyError ||
              e instanceof RequiredParameterError
            ? 400
            : 500,
      });
    }
  }

  async function remove(httpRequest) {
    const { id } = httpRequest.pathParams || {};
    const { max, ...params } = httpRequest.queryParams || {};

    let searchParams = formatSearchParam(id, params);

    const result = await modelGenericList.remove(searchParams);
    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 200,
      data: JSON.stringify(result),
    };
  }

  async function update(httpRequest) {
    const { id } = httpRequest.pathParams || {};
    const { max, ...params } = httpRequest.queryParams || {};

    let searchParams = formatSearchParam(id, params);

    let model_genericInfo = httpRequest.body;
    if (!model_genericInfo) {
      return makeHttpError({
        statusCode: 400,
        errorMessage: "Bad request. No PUT body",
      });
    }

    if (typeof httpRequest.body == "string") {
      try {
        model_genericInfo = JSON.parse(model_genericInfo);
      } catch {
        return makeHttpError({
          statusCode: 400,
          errorMessage: "Bad request. PUT body must be valid JSON.",
        });
      }
    }

    try {
      // model_genericInfo.model_genericId = id;
      const result = await modelGenericList.update({
        searchParams: searchParams,
        model_generic_info: model_genericInfo,
      });
      return {
        headers: {
          "Content-Type": "application/json",
        },
        statusCode: 200,
        data: JSON.stringify(result),
      };
    } catch (e) {
      return makeHttpError({
        errorMessage: e.message,
        statusCode:
          e instanceof UniqueConstraintError
            ? 409
            : e instanceof InvalidPropertyError ||
              e instanceof RequiredParameterError
            ? 400
            : 500,
      });
    }
  }
};
