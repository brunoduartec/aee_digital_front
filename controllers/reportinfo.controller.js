//refreshTimeInMinutes
const config = require("../helpers/config");
module.exports = class ReportInfo {
  constructor(
    exporter,
    trabalhoscontroller,
    regionalcontroller,
    refreshTimeInMinutes = config?.controllers?.reportinfo
      ?.refreshTimeInMinutes,
    logger = require("../helpers/logger")
  ) {
    const Repeater = require("../helpers/repeater.helper");
    this.exporter = exporter;
    this.repeater = new Repeater(logger);
    this.logger = logger;
    this.refreshTimeInMinutes = refreshTimeInMinutes;
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
      return m._id == centroId;
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

  refreshCentro(centro) {
    const instance = this;
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const centroID = centro._id;
          const regionalName = centro.REGIONAL.NOME_REGIONAL;
          let regional = instance.reports[regionalName];
          if (!instance.reports[regionalName]) {
            instance.reports[regionalName] = { centros: [] };
            regional = instance.reports[regionalName];
          }

          let centroInfo = await instance.getCentroInfo(centroID);
          let centroReport = {
            NOME_CENTRO: centroInfo.NOME_CENTRO,
            NOME_CURTO: centroInfo.NOME_CURTO,
            ID: centroID,
            RESPONSES: [],
          };
          const centroResponses = instance.responses.filter((m) => {
            return m.CENTRO_ID == centroID;
          });
          centroReport.RESPONSES = centroResponses.map((m) => {
            try {
              const centroAnswer = {
                QUESTION: m?.QUESTION_ID?.QUESTION,
                ANSWER: m?.ANSWER,
                QUESTION_ID: m?.QUESTION_ID?._id,
              };
              return centroAnswer;
            } catch (error) {
              this.logger.error(
                `controller:reportinfo.controller:${centroInfo.NOME_CENTRO}`,
                error
              );
            }
          });
          regional.centros.push(centroReport);
          resolve(centro);
        } catch (error) {
          reject(error);
        }
      })();
    });
  }

  haltFunction() {
    return false;
  }

  async repeatedRefresh(size) {
    let instance = this;
    const report = await instance.refresh(size);
    this.repeater.repeat(async function () {
      await instance.refresh(size);
    }, this.refreshTimeInMinutes);

    return report;
  }

  async refresh(size) {
    try {
      await this.refreshBaseInfo();

      let status = {
        errors: [],
        success: [],
      };

      size = size || this.centros.length;

      let promises = [];
      for (let index = 0; index < size; index++) {
        const centro = this.centros[index];
        promises.push(this.refreshCentro(centro));
      }

      await Promise.all(promises)
        .then((centros) => {
          status.success = centros;
        })
        .catch((errors) => {
          status.errors = errors;
        });

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
