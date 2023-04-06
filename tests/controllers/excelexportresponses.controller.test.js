const ExcelExportResponsesClass = require("../../controllers/excelexportresponses.controller");

const form_mock = require("../form.mock.json");
const centros_mock = require("../centros.mock.json");
const regionais_mock = require("../regionais.mock.json");
const summaries_mock = require("../summaries.mock.json");
const response_mock = require("../responses.mock.json");


// Import the module that contains the formatCentroToExport function
describe('ExcelExportResponses', () => {
  describe('formatCentroToExport', () => {
    // Mock regionaiscontroller and trabalhoscontroller with jest.fn()
    const regionaiscontroller = {
      getCentroByParam: jest.fn(() => Promise.resolve([{ NOME_CENTRO: 'Centro A', REGIONAL: { NOME_REGIONAL: 'Regional X' } }])),
    };
    const trabalhoscontroller = {
      getQuizResponseByParams: jest.fn(() => Promise.resolve({ data: 'some data' })),
    };

    // Create a new instance of ExcelExportResponses, passing in the mocked controllers
    const ExcelExportResponses = new ExcelExportResponsesClass(regionaiscontroller, trabalhoscontroller);

    it('should return formatted centro info', async () => {
      // Call the function with a mock centroId
      const result = await ExcelExportResponses.formatCentroToExport('123');

      // Check that the expected functions were called with the expected arguments
      expect(regionaiscontroller.getCentroByParam).toHaveBeenCalledWith({ _id: '123' });
      expect(trabalhoscontroller.getQuizResponseByParams).toHaveBeenCalledWith({ CENTRO_ID: '123' });

      // Check that the result is formatted correctly
      expect(result).toEqual({
        centroName: 'Centro A',
        regionalName: 'Regional X',
        infoFormated: [{ data: 'some data' }],
      });
    });

    it('should throw an error if either controller function throws an error', async () => {
      // Mock the getCentroByParam function to throw an error
      regionaiscontroller.getCentroByParam.mockImplementationOnce(() => Promise.reject(new Error('Error')));

      // Call the function with a mock centroId and expect it to throw an error
      await expect(ExcelExportResponses.formatCentroToExport('123')).rejects.toThrowError('Error');

      // Check that the expected functions were called with the expected arguments
      expect(regionaiscontroller.getCentroByParam).toHaveBeenCalledWith({ _id: '123' });
      expect(trabalhoscontroller.getQuizResponseByParams).not.toHaveBeenCalled();
    });
  });
});


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
