module.exports = class ReportInfo {
  constructor(
    exporter,
    logger,
    trabalhoscontroller,
    regionalcontroller,
    refreshTimeInMinutes = 5
  ) {
    const Repeater = require("../helpers/repeater.helper");
    this.exporter = exporter;
    this.repeater = new Repeater(logger);
    this.logger = logger;
    this.refreshTimeInMinutes = 5;
    this.lastRefresh;

    this.trabalhoscontroller = trabalhoscontroller;
    this.regionalcontroller = regionalcontroller;

    this.answers = {};
    this.centros = {};
    this.summaries = {};
    this.reports = {};

    this.initialized = false;
    this.halted = false;
    this.count = 3;
  }

  hasInitialized() {
    return this.initialized;
  }

  async getCentroInfo(centroId) {
    const centro = this.centros.find((m) => {
      return m.ID == centroId;
    });

    return centro;
  }

  async getCentrosInfo() {
    return this.centros;
  }

  async getRegionaisInfo() {
    return this.regionais;
  }

  async getCentrosInRegionalInfo(regionalName) {
    const centros = this.centros.filter((m) => {
      return m.REGIONAL.NOME_REGIONAL == regionalName;
    });

    return centros;
  }

  async getCentroReportInfo(regional, centroId) {
    const centroReportInfo = this.reports[regional].centros.find((m) => {
      return m.ID == centroId;
    });

    return centroReportInfo;
  }

  async getCentroSummary(centroId) {
    const summaries = this.summaries.filter((m) => {
      return m.CENTRO_ID == centroId;
    });

    let lastSummary = summaries.sort(function (a, b) {
      let dateA = new Date(a.LASTMODIFIED);
      let dateB = new Date(b.LASTMODIFIED);

      if (dateA > dateB) {
        return -1;
      } else {
        return 1;
      }
    });

    if (lastSummary) {
      return lastSummary[0];
    }
    return;
  }

  async refreshBaseInfo() {
    this.centros = await this.regionalcontroller.getCentros();
    this.regionais = await this.regionalcontroller.getRegionais();
    this.summaries = await this.trabalhoscontroller.getSummaries();
    this.responses = await this.trabalhoscontroller.getQuizResponses();
  }

  async refresh(size) {
    try {
      this.logger.info("CHAMOU");

      await this.refreshBaseInfo();

      let status = {
        errors: [],
        success: [],
      };

      size = size || this.centros.length;
      for (let index = 0; index < size; index++) {
        try {
          const centro = this.centros[index];
          const centroID = centro.ID;
          const regionalName = centro.REGIONAL.NOME_REGIONAL;
          let regional = this.reports[regionalName];
          if (!this.reports[regionalName]) {
            this.reports[regionalName] = { centros: [] };
            regional = this.reports[regionalName];
          }

          // const summary = await this.getCentroSummary(centroID);

          // if (summary) {
          let centroInfo = await this.getCentroInfo(centroID);

          let centroReport = {
            NOME_CENTRO: centroInfo.NOME_CENTRO,
            NOME_CURTO: centroInfo.NOME_CURTO,
            ID: centroID,
            RESPONSES: [],
          };

          const centroResponses = this.responses.filter((m) => {
            return m.CENTRO_ID == centroID;
          });

          centroResponses.forEach((answer) => {
            let centroAnswer;
            try {
              centroAnswer = {
                QUESTION: answer.QUESTION_ID.QUESTION,
                ANSWER: answer.ANSWER,
                QUESTION_ID: answer.QUESTION_ID._id,
              };
            } catch (error) {
              centroAnswer = {
                QUESTION: "BANANA",
                ANSWER: answer.ANSWER,
              };
            }

            centroReport.RESPONSES.push(centroAnswer);
          });

          // summary.ANSWERS.forEach((question) => {
          //   let answer = this.responses.find((m) => {
          //     return m.ID == question;
          //   });

          //   let centroAnswer;
          //   try {
          //     centroAnswer = {
          //       QUESTION: answer.QUESTION_ID.QUESTION,
          //       ANSWER: answer.ANSWER,
          //       QUESTION_ID: answer.QUESTION_ID._id,
          //     };
          //   } catch (error) {
          //     centroAnswer = {
          //       QUESTION: "BANANA",
          //       ANSWER: answer.ANSWER,
          //     };
          //   }

          //   centroReport.RESPONSES.push(centroAnswer);
          // });

          regional.centros.push(centroReport);
          status.success.push({
            centro,
          });
          //  }
        } catch (error) {
          status.errors.push({
            error,
          });
        }
      }

      this.initialized = true;
      return {
        info: this.reports,
        status,
      };
    } catch (error) {
      return {
        error,
      };
    }
  }
};
