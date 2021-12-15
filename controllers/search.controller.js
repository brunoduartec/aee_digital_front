module.exports = class SearchController {
  constructor(regionalcontroller, trabalhocontroller, logger, parser) {
    this.regionalcontroller = regionalcontroller;
    this.trabalhocontroller = trabalhocontroller;
    this.logger = logger;
    this.parser = parser;
  }

  async getPesquisaResult(pesquisaInfo) {
    const regionalcontroller = this.regionalcontroller;
    const trabalhocontroller = this.trabalhocontroller;

    const regional = pesquisaInfo.regional;
    const centro = pesquisaInfo.centro;
    const trabalho = pesquisaInfo.trabalho;
    const search = pesquisaInfo.search;
    const opcao = pesquisaInfo.option;

    const searchByOpcao = {
      Centro: async function (s) {
        const paramsParsed = this.parser.getParamsParsed({
          NOME_CURTO: search,
        });
        const centro = await regionalcontroller.getCentroByParam(paramsParsed);
        let centros = {
          amount: centro ? centro.length : 0,
          items: centro,
        };

        this.logger.info("getPesquisaResult:Centro", centros);
        return centros;
      },
      Centro_Summary: async function () {
        let centroInfo = [];
        const paramsParsed = this.parser.getParamsParsed({
          NOME_CURTO: centro,
        });

        centroInfo.push(
          await regionalcontroller.getCentroByParam(paramsParsed)
        );
        const centro_id = centroInfo[0].ID;

        paramsParsed = this.parser.getParamsParsed({
          CENTRO_ID: centro_id,
        });

        let centroSummary = {};
        const summary =
          await this.trabalhocontroller.getAtividadesCentroSummaryByParams(
            paramsParsed
          );
        centroSummary.items = [];
        centroSummary.amount = 0;

        const atividade_order = [
          "Assistência Espiritual",
          "Curso Básico",
          "Escola de Aprendizes do Evangelho",
          "Curso de Médiuns",
          "Evangelização Infantil",
          "Pré-Mocidade",
          "Mocidade",
        ];

        atividade_order.forEach((atividade_name) => {
          const item = summary.find((summary) => {
            return summary.ATIVIDADE.NOME_ATIVIDADE == atividade_name;
          });
          if (item) {
            centroSummary.items.push(item);
            centroSummary.amount++;
          }
        });

        this.logger.info("getPesquisaResult:Centro_Summary", centroSummary);
        return centroSummary;
      },

      Trabalho: async function (s) {
        let centros;

        if (regional != "Todos") {
          centros = await regionalcontroller.getCentrosByRegional(regional);
        } else {
          centros = await regionalcontroller.getCentros();
        }

        let atividades = {};

        atividades.items = [];
        atividades.amount = 0;

        for (let index = 0; index < centros.length; index++) {
          const centro = centros[index];
          const centro_id = centro.ID;

          let paramsParsed = this.parser.getParamsParsed({
            CENTRO_ID: centro_id,
            "ATIVIDADE.NOME_ATIVIDADE": trabalho != "Todos" ? trabalho : null,
          });

          let atividade =
            await this.trabalhocontroller.getAtividadesCentroByParams(
              paramsParsed
            );

          atividades.amount += atividade.length;
          for (let index = 0; index < atividade.length; index++) {
            let element = atividade[index];
            element.NOME_CENTRO = centro.NOME_CENTRO;
            element.REGIONAL = centro.REGIONAL.NOME_REGIONAL;
          }
          if (atividade && atividade.length > 0) {
            atividades.items.push(atividade);
          }
        }

        this.logger.info("getPesquisaResult:Trabalhos", atividades);
        return atividades;
      },
      Regional: async function (s) {
        const centros = await regionalcontroller.getCentros();
        let regional = {
          amount: centros.length,
          items: centros,
        };
        this.logger.info("getPesquisaResult:Regional", regional);
        return regional;
      },

      Quiz: async function (s) {
        let name = search.name;
        let centro_id = search.id;
        const page = search.page;

        let paramsParsed = this.parser.getParamsParsed({
          NAME: name,
        });

        let form_template = await this.trabalhocontroller.getFormByParams(
          paramsParsed
        );

        form_template = form_template[0];
        let pages = form_template.PAGES;
        let page_titles = pages.map((m) => {
          return m.PAGE_NAME;
        });

        paramsParsed = this.parser.getParamsParsed({
          CENTRO_ID: centro_id,
        });

        if (page < pages.length) {
          let page_info = pages[page];
          pages = [];
          pages.push(page_info);
        }

        for (let index = 0; index < pages.length; index++) {
          const page = pages[index];

          let quizes = page.QUIZES;
          for (let index = 0; index < quizes.length; index++) {
            const quiz = quizes[index];

            paramsParsed = this.parser.getParamsParsed({
              CENTRO_ID: centro_id,
              QUIZ_ID: quiz._id,
            });

            const quiz_responses =
              await this.trabalhocontroller.getQuizResponseByParams(
                paramsParsed
              );

            let groups = quiz.QUESTIONS;

            for (let j = 0; j < groups.length; j++) {
              const group = groups[j].GROUP;

              for (let k = 0; k < group.length; k++) {
                const question = group[k];
                
                let answer = quiz_responses.filter(
                  (m) => m.QUESTION_ID == question._id
                );
                if (answer) {
                  question.ANSWER = JSON.parse(JSON.stringify(answer.map(m=>{return m.ANSWER})));
                  question.ANSWER_ID = JSON.parse(JSON.stringify(answer.map(m=>{return m.ID})))
                }
              }

            }
          }
        }

        let quiz = {
          templates: form_template,
          titles: page_titles,
        };

        this.logger.info("getPesquisaResult:Quiz", quiz);
        return quiz;
      },
    };
    return await searchByOpcao[opcao].call(this);
  }
};
