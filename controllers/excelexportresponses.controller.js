module.exports = class ExcelExportReportsController {
  constructor(
    exporter,
    exportresponses,
    trabalhoscontroller,
    logger,
    parser = require("../helpers/parser")
  ) {
    this.exporter = exporter;
    this.exportresponses = exportresponses;
    this.trabalhoscontroller = trabalhoscontroller;
    this.logger = logger;
    this.parser = parser;
    this.headers = [];
  }

  async init() {
    try {
      const params = {
        NAME: "Cadastro de Informações Anual",
      };

      const paramsParsed = this.parser.getParamsParsed(params);
      const forms = await this.trabalhoscontroller.getFormByParams(
        paramsParsed
      );
      const form = forms[0];

      for (let index = 0; index < form.PAGES.length; index++) {
        const page = form.PAGES[index];

        for (let index = 0; index < page.QUIZES.length; index++) {
          const quiz = page.QUIZES[index];

          for (let index = 0; index < quiz.QUESTIONS.length; index++) {
            const grouped_question = quiz.QUESTIONS[index];

            for (
              let index = 0;
              index < grouped_question.GROUP.length;
              index++
            ) {
              const question = grouped_question.GROUP[index];
              const headerItem = {
                header: question.QUESTION,
                key: question._id,
              };

              this.headers.push(headerItem);
            }
          }
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  getFormatInfo(data) {
    try {
      let item = {};

      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        item[`id_${index}`] = element.ANSWER || " ";
      }

      return item;
    } catch (error) {
      throw error;
    }
  }

  getHeaders() {
    return this.headers;
  }

  getCentroFileName(centroName, regionalName) {
    const timeStamp = new Date().getTime();
    return `${regionalName}_${centroName}`;
  }

  getRegionalFileName(regionalName) {
    const timeStamp = new Date().getTime();
    return `${regionalName}`;
  }

  getAllFileName() {
    return `General_Report`;
  }

  async exportCentro(centroId) {
    try {
      const infoFormated = await this.formatCentroToExport(centroId);
      let fileSaved = await this.exporter.export(
        this.getCentroFileName(
          infoFormated.centroName,
          infoFormated.regionalName
        ),
        this.getHeaders(),
        infoFormated.infoFormated,
        this.getFormatInfo
      );
      return fileSaved.substring(8);
    } catch (error) {
      console.log("É a vida");
    }
  }

  async exportRegional(regionalName) {
    const centros = await this.exportresponses.getCentrosInRegionalInfo(
      regionalName
    );
    const fileName = this.getRegionalFileName(regionalName);

    return await this.exportBatch(fileName, centros);
  }

  async exportAll() {
    const centros = await this.exportresponses.getCentrosInfo();
    const fileName = this.getAllFileName();

    return await this.exportBatch(fileName, centros);
  }

  async exportBatch(fileName, context) {
    let infoFormated = [];
    for (let index = 0; index < context.length; index++) {
      const item = context[index];
      const centroId = item.ID;
      try {
        const centroInfoFormated = await this.formatCentroToExport(centroId);
        infoFormated = infoFormated.concat(centroInfoFormated.infoFormated);
      } catch (error) {
        console.log("Nao conseguiu");
      }
    }

    let fileSaved = await this.exporter.export(
      fileName,
      this.getHeaders(),
      infoFormated,
      this.getFormatInfo
    );
    return fileSaved.substring(8);
  }

  async formatCentroToExport(centroId) {
    try {
      const centroInfo = await this.exportresponses.getCentroInfo(centroId);

      const centroName = centroInfo.NOME_CENTRO;
      const regionalName = centroInfo.REGIONAL.NOME_REGIONAL;

      const centroReportInfo = await this.getCentroReportInfo(
        regionalName,
        centroId
      );
      const data = centroReportInfo.RESPONSES;

      const infoFormated = [];
      infoFormated.push(data);

      return {
        centroName,
        regionalName,
        infoFormated,
      };
    } catch (error) {
      throw { error };
    }
  }
};
