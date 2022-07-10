const ExportResponses = require("../../controllers/exportresponses.controller");
const ExcelExportResponses = require("../../controllers/excelexportresponses.controller");

const form_mock = require("../form.mock.json");

const excelExporterController = require("../../controllers/excelexporter.controller");
const excelexportercontroller = new excelExporterController();

const trabalhocontroller = {
  getFormByParams: async function () {
    return form_mock;
  },
};

const regionalcontroller = {
  getCentros: async function () {
    return {};
  },
};

const logger = {
  info: function (info) {
    console.log(info);
  },
};

const excelexporter_mock = {
  export: function () {
    console.log("ARQUIVO");
    return {};
  },
};

const parser = {
  getParamsParsed: function (params) {
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

    logger.info(`getParamsParsed => ${paramsParsed.substring(1)}`);

    return paramsParsed.substring(1);
  },
};

describe("controllers:exportexcelresponses", () => {
  it("should validade refresh", async () => {
    const exporter = new ExportResponses(
      excelexporter_mock,
      logger,
      trabalhocontroller,
      regionalcontroller
    );

    const excelexporter = new ExcelExportResponses(
      excelexportercontroller,
      exporter,
      trabalhocontroller,
      logger,
      parser
    );

    const init = await excelexporter.init();

    expect(init).toBe(true);
  });
});
