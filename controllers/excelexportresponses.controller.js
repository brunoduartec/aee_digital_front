module.exports = class ExcelExportReportsController {
  constructor(
    exporter,
    trabalhoscontroller,
    Regionaiscontroller = require("./regional.controller"),
    parser = require("../helpers/parser"),
    logger = require("../helpers/logger")
  ) {
    this.exporter = exporter;
    this.regionaiscontroller = new Regionaiscontroller();
    this.trabalhoscontroller = trabalhoscontroller;
    this.logger = logger;
    this.parser = parser;
    this.headers = [];
  }

  async init() {
    try {

      const [form] = await this.trabalhoscontroller.getFormByParams({ NAME: "Cadastro de Informações Anual" });
      this.headers = form.PAGES.flatMap(
        (page) =>
          page.QUIZES.flatMap(
            (quiz) =>
              quiz.QUESTIONS.flatMap((grouped_question) =>
                grouped_question.GROUP.map(({ QUESTION: header, _id: key }) => ({
                  header,
                  key,
                }))
              )
          )
      );

      let coord_quiz = await this.trabalhoscontroller.getQuizTemplateByParams({
        CATEGORY: "Coordenador",
      });

      const newHeaders = coord_quiz.flatMap(
        (quiz) =>
          quiz.QUESTIONS.flatMap((grouped_question) =>
            grouped_question.GROUP.map(({ QUESTION: header, _id: key }) => ({
              header,
              key,
            }))
          )
      )

      this.headers = this.headers.concat(newHeaders)

      return true;
    } catch (error) {
      this.logger.error(`controllers:excelexporterresponses:init: ${error}`);
      return false;
    }
  }

  getFormatInfo(data) {
    try {
      let item = {};

      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if (element?.QUESTION_ID && !item[element.QUESTION_ID]) {
          item[element.QUESTION_ID] = element.ANSWER || " ";
        }
      }

      return item;
    } catch (error) {
      this.logger.error(`getFormatInfo ${data}: ${error}`);
      throw error;
    }
  }

  getHeaders() {
    return this.headers;
  }

  getCentroFileName(centroName, regionalName) {
    return `${regionalName}_${centroName}`;
  }

  getRegionalFileName(regionalName) {
    return `${regionalName}`;
  }

  getAllFileName() {
    return `General_Report`;
  }

  async exportCentro(centroId, exporting_guid, io) {
    try {
      const infoFormated = await this.formatCentroToExport(centroId, exporting_guid, io);
  
      const fileSaved = await this.exporter.export(
        this.getCentroFileName(
          infoFormated.centroName,
          infoFormated.regionalName
        ),
        this.getHeaders(),
        infoFormated.infoFormated,
        this.getFormatInfo
      );
  
      return fileSaved.substring(8); // Assuming the first 8 characters are a prefix to be removed
    } catch (error) {
      this.logger.error(`ExportingCentro :${centroId}: ${error}`);
      throw error;
    }
  }

  async exportCentrosByRegional(regionalName, exporting_guid, io) {
    const centros = await this.reportinfo.getCentrosInRegionalInfo(
      regionalName
    );
  
    const files = await Promise.all(centros.map(async (centro) => {
      return this.exportCentro(centro._id, exporting_guid, io);
    }))
    .then((f) => {
      this.logger.info(
        `controller:excelexportresponses.controller:exportCentrosByRegional ${f}`
      );
      return f;
    })
    .catch((error) => {
      this.logger.error(
        `controller:excelexportresponses.controller:exportCentrosByRegional ${error}`
      );
      throw new Error(error);
    });
  
    return files;
  }

  async exportRegional(regionalName, exporting_guid, io) {

    let centros = await this.regionaiscontroller.getCentroByParam({"REGIONAL.NOME_REGIONAL": regionalName});

    const fileName = this.getRegionalFileName(regionalName);

    return await this.exportBatch(fileName, centros, exporting_guid, io);
  }

  async exportRegionais(exporting_guid, io) {
    const regionais = await this.regionaiscontroller.getRegionais();
  
    // Use Promise.all() to export regionals in parallel
    const files = await Promise.all(regionais.map(async (regional) => {
      const regionalFile = await this.exportRegional(regional.NOME_REGIONAL, exporting_guid, io);
      return regionalFile;
    }));
  
    return files;
  }

  async exportAll(exporting_guid, io) {
    const centros = await this.regionaiscontroller.getCentros();
    const fileName = this.getAllFileName();

    return await this.exportBatch(fileName, centros, exporting_guid, io);
  }

  async exportBatch(fileName, context, exporting_guid, io) {
    try {

      io.emit(
        "started",{
        "event":"started",
        "amount": context.length,
        exporting_guid
      });
      // Call this.formatCentroToExport() in parallel for each centroId using Promise.all() and map()
      const centroInfoPromises = context.map(item => this.formatCentroToExport(item._id, exporting_guid, io));
      const centroInfoResults = await Promise.all(centroInfoPromises);
  
      // Concatenate the formatted info into a single array
      let infoFormated = [];
      for (const centroInfoResult of centroInfoResults) {
        infoFormated = infoFormated.concat(centroInfoResult.infoFormated);
      }

      io.emit("finished",{
        "event":"finished",
        exporting_guid
      });
  
      const fileSaved = await this.exporter.export(
        fileName,
        this.getHeaders(),
        infoFormated,
        this.getFormatInfo
      );
      return fileSaved.substring(8);
    } catch (error) {
      console.log("Nao conseguiu");
      throw new Error(error)
    }
  }
  

  async formatCentroToExport(centroId, exporting_guid, io) {
    try {
      // Use Promise.all() to fetch centroInfo and data in parallel
      const [centroInfo, data] = await Promise.all([
        this.regionaiscontroller.getCentroByParam({ _id: centroId }),
        this.trabalhoscontroller.getQuizResponseByParams({ CENTRO_ID: centroId }),
      ]);
  
      const { NOME_CENTRO: centroName, REGIONAL: { NOME_REGIONAL: regionalName } } = centroInfo[0];
      this.logger.info(`formated; ${centroName}`)

      io.emit("progress",{
        "event":"progress",
        exporting_guid,
        centroId
      });

      // Return info directly instead of pushing it into an array and then returning the array
      return {
        centroName,
        regionalName,
        infoFormated: [data],
      };
    } catch (error) {
      // Rethrow the error instead of wrapping it in an object
      this.logger.error(`formatCentroToExport: ${centroId}: ${error}`);
      io.emit("error",{
        "event":"error",
        exporting_guid,
        centroId
      });
      throw error;
    }
  }
};
