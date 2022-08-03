const ReportInfo = require("../../controllers/reportinfo.controller");

const centros_mock = require("../centros.mock.json");
const summaries_mock = require("../summaries.mock.json");
const response_mock = require("../responses.mock.json");

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

  it("should validade refresh repeated", async () => {
    const instance = new ReportInfo(
      exporter,
      logger,
      trabalhocontroller,
      regionalcontroller,
      0.1
    );
    const reports = await instance.repeatedRefresh();

    expect(reports.info["ABC"].centros.length).toBeGreaterThan(1);
  });
});
