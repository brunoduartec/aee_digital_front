const ExportResponses = require("../../controllers/exportresponses.controller");
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
};

jest.setTimeout(100000);

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
    const instance = new ExportResponses(
      exporter,
      logger,
      trabalhocontroller,
      regionalcontroller
    );
    const size = 3;
    const reports = await instance.refresh(size);

    expect(reports.info["ABC"].centros.length).toBe(size);
  });

  // it("should validade centro reports", async () => {
  //   const instance = new ExportResponses(
  //     excelexportercontroller,
  //     logger,
  //     trabalhocontroller,
  //     regionalcontroller
  //   );
  //   const reports = await instance.refresh();
  //   const centroId = "61b0ba7b71572500128b85dd";
  //   const excelreports = await instance.exportCentro(centroId);
  // });

  // it("should validade regional reports", async () => {
  //   const instance = new ExportResponses(
  //     excelexportercontroller,
  //     logger,
  //     trabalhocontroller,
  //     regionalcontroller
  //   );
  //   const reports = await instance.refresh();
  //   const regional = "ABC";
  //   const excelreports = await instance.exportRegional(regional);
  // });

  // it("should validade general reports", async () => {
  //   const instance = new ExportResponses(
  //     excelexportercontroller,
  //     logger,
  //     trabalhocontroller,
  //     regionalcontroller
  //   );
  //   const reports = await instance.refresh();
  //   const excelreports = await instance.exportAll();
  // });
});
