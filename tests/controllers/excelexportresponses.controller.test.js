const ReportInfo = require("../../controllers/reportinfo.controller");
const ExcelExportResponses = require("../../controllers/excelexportresponses.controller");

const form_mock = require("../form.mock.json");
const centros_mock = require("../centros.mock.json");
const regionais_mock = require("../regionais.mock.json");
const summaries_mock = require("../summaries.mock.json");
const response_mock = require("../responses.mock.json");

const excelexportercontroller = {
  export: function () {
    return "arquivomaneiro.xls";
  },
};

const trabalhocontroller = {
  getSummaries: async function () {
    return summaries_mock;
  },
  getQuizResponses: async function () {
    return response_mock;
  },
  getFormByParams: async function () {
    return form_mock;
  },
};

const regionalcontroller = {
  getCentros: async function () {
    return centros_mock;
  },
  getRegionais: async function () {
    return regionais_mock;
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

const exporter = new ReportInfo(
  excelexporter_mock,
  trabalhocontroller,
  regionalcontroller,
  0,
  logger
);

const excelexporter = new ExcelExportResponses(
  excelexportercontroller,
  exporter,
  trabalhocontroller
);

(async () => {
  await excelexporter.init();
})();

// describe("controllers:exportexcelresponses", () => {
//   it("should validade init", async () => {
//     const init = await excelexporter.init();

//     expect(init).toBe(true);
//   });

//   it("should validade formatInfo", async () => {
//     const data = [
//       {
//         ANSWER: "Banana",
//         QUESTION_ID: "id_1",
//       },
//       {
//         ANSWER: "Banana",
//         QUESTION_ID: "id_2",
//       },
//     ];
//     const formatInfo = await excelexporter.getFormatInfo(data);
//     const expected = formatInfo["id_1"];

//     expect(typeof formatInfo).toBe("object");
//     expect(expected).toBe("Banana");
//   });

//   it("should validade headers", async () => {
//     await excelexporter.init(3);
//     const headers = await excelexporter.getHeaders();

//     expect(headers.length).toBe(130);
//   });

//   it("should validade centro reports", async () => {
//     await excelexporter.init(3);

//     const centroId = "61b0ba7e71572500128b85df";
//     const response = await excelexporter.exportCentro(centroId);
//     expect(response.length).toBeGreaterThan(1);
//   });

//   it("should validade centro of a regional reports", async () => {
//     await excelexporter.init(3);

//     const regional = "ABC";
//     const response = await excelexporter.exportCentrosByRegional(regional);
//     expect(response.length).toBeGreaterThan(1);
//   });

//   it("should validade regional reports", async () => {
//     await excelexporter.init();

//     const regional = "NORDESTE";
//     const response = await excelexporter.exportRegional(regional);
//     expect(response[0].length).toBeGreaterThan(1);
//   });

//   it("should validade regionais reports", async () => {
//     await excelexporter.init();

//     const response = await excelexporter.exportRegionais();
//     expect(response.length).toBeGreaterThan(1);
//   });

//   it("should validade general reports", async () => {
//     await excelexporter.init();

//     const response = await excelexporter.exportAll();
//     expect(response.length).toBeGreaterThan(1);
//   });
// });
