const makeModelGeneric = require("./model_generic_entity");
module.exports = function makeModelGenericList({ database, modelName }) {
  return Object.freeze({
    add,
    findByItems,
    getItems,
    remove,
    replace,
    update,
  });

  function formatOutput(items) {
    let output = [];

    if (items) {
      if (items.length > 0) {
        items.forEach((item) => {
          let itemToPush = makeModelGeneric(item, modelName);
          output.push(itemToPush);
        });
      }
    }

    return output;
  }

  async function add(model_genericInfo) {
    try {
      let model_generic = makeModelGeneric(model_genericInfo, modelName);
      return await database.add(modelName, model_generic);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async function findByItems({ max, searchParams }) {
    try {
      let model_generic_info = await database.findByItems(
        modelName,
        max,
        searchParams
      );

      model_generic_info = formatOutput(model_generic_info);
      return model_generic_info;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async function getItems({ max }) {
    try {
      let items = await database.getItems(modelName, max);

      let model_generics_info = formatOutput(items);
      return model_generics_info;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async function remove(searchParams) {
    try {
      return await database.remove(modelName, searchParams);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async function replace({ searchParams, model_generic_info }) {
    try {
      return await database.replace(
        modelName,
        model_generic_info,
        searchParams
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async function update({ searchParams, model_generic_info }) {
    try {
      return await database.update(modelName, model_generic_info, searchParams);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
};
