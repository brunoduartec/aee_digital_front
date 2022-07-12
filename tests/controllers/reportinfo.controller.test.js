const ReportInfo = require("../../controllers/reportinfo.controller");
const mock = require("../mocks.json");

const centros_mock = require("../centros.mock.json");
const summaries_mock = require("../summaries.mock.json");
const response_mock = require("../responses.mock.json");

const excelExporterController = require("../../controllers/excelexporter.controller");
const excelexportercontroller = new excelExporterController();

const regionalcontroller = {
  getCentros: async function () {
    return centros_mock;
  },
  getRegionais: async function () {
    return {};
  },
};

const trabalhocontroller = {
  getSummaries: async function () {
    return summaries_mock;
  },
  getQuizResponses: async function () {
    return response_mock;
  },
};

const logger = {
  info: function (info) {
    console.log(info);
  },
};

const exporter = {
  export: function () {
    console.log("ARQUIVO");
    return {};
  },
};

describe("controllers:exporterresponses", () => {
  it("should validade refresh", async () => {
    const instance = new ReportInfo(
      exporter,
      logger,
      trabalhocontroller,
      regionalcontroller
    );
    const size = 3;
    const reports = await instance.refresh(size);

    expect(reports.info["ABC"].centros.length).toBe(size);
  });
});
