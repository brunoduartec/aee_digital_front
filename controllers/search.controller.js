module.exports = class SearchController {
  constructor(
    regionalcontroller,
    trabalhoscontroller,
    logger = require("../helpers/logger"),
    parser = require("../helpers/parser")
  ) {
    this.regionalcontroller = regionalcontroller;
    this.trabalhoscontroller = trabalhoscontroller;
    this.logger = logger;
    this.parser = parser;
  }

  async getPesquisaResult(pesquisaInfo) {
    const regionalcontroller = this.regionalcontroller;

    const regional = pesquisaInfo.regional;
    const centro = pesquisaInfo.centro;
    const trabalho = pesquisaInfo.trabalho;
    const search = pesquisaInfo.search;
    const opcao = pesquisaInfo.option;

    const searchByOpcao = {
      Centro: async function () {
        const paramsParsed = this.parser.getParamsParsed({
          NOME_CURTO: decodeURIComponent(search),
        });
        const centro = await regionalcontroller.getCentroByParam(paramsParsed);
        let centros = {
          amount: centro ? centro.length : 0,
          items: centro,
        };

        this.logger.info(
          `controller:search.controller:getPesquisaResult:Centro ${centros}`
        );
        return centros;
      },
      Centro_Summary: async function () {
        let centroInfo = [];
        let paramsParsed = this.parser.getParamsParsed({
          NOME_CURTO: decodeURIComponent(centro),
        });

        centroInfo.push(
          await regionalcontroller.getCentroByParam(paramsParsed)
        );
        const centro_id = centroInfo[0]._id;

        let centroSummary = {};
        const summary = await this.trabalhoscontroller.getAtividadesCentroSummaryByParams( { CENTRO_ID: centro_id } );
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

        this.logger.info(
          `controller:search.controller:getPesquisaResult:Centro_Summary: ${centroSummary}`
        );
        return centroSummary;
      },

      Trabalho: async function () {
        let centros;

        if (regional != "Todos") {
          centros = await regionalcontroller.getCentroByParam({"REGIONAL.NOME_REGIONAL": regional});
        } else {
          centros = await regionalcontroller.getCentros();
        }

        let atividades = {};

        atividades.items = [];
        atividades.amount = 0;

        for (let index = 0; index < centros.length; index++) {
          const centro = centros[index];
          const centro_id = centro._id;

          let atividade = await this.trabalhoscontroller.getAtividadesCentroByParams( { CENTRO_ID: centro_id, "ATIVIDADE.NOME_ATIVIDADE": trabalho != "Todos" ? trabalho : null, } );

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

        this.logger.info(
          `controller:search.controller:getPesquisaResult:Trabalhos: ${atividades}`
        );
        return atividades;
      },
      Regional: async function () {
        const centros = await regionalcontroller.getCentros();
        let regional = {
          amount: centros.length,
          items: centros,
        };
        this.logger.info(
          `controller:search.controller:getPesquisaResult:Regional: ${regional}`
        );
        return regional;
      },

      Quiz: async function () {
        let name = search.name;
        let centro_id = search.id;
        const page = search.page;
        let finalized = false;

        let form_template = await this.trabalhoscontroller.getFormByParams( { NAME: name } );

        form_template = form_template[0];
        let pages = form_template.PAGES;
        let page_titles = pages.map((m) => {
          return m.PAGE_NAME;
        });

        if (page < pages.length) {
          let page_info = pages[page];
          pages = [];
          pages.push(page_info);
        } else {
          finalized = await this.trabalhoscontroller.checkFormCompletion(
            name,
            centro_id
          );
        }

        const quiz_responses = await this.trabalhoscontroller.getQuizResponseByParams({ CENTRO_ID: centro_id, fields:"QUESTION_ID,_id,ANSWER" });

        for (let index = 0; index < pages.length; index++) {
          const page = pages[index];

          let quizes = page.QUIZES;
          for (let index = 0; index < quizes.length; index++) {
            const quiz = quizes[index];

            let groups = quiz.QUESTIONS;

            for (let j = 0; j < groups.length; j++) {
              const groupInfo = groups[j]
              const group = groupInfo.GROUP;

              for (let k = 0; k < group.length; k++) {
                const question = group[k];

                let answer

                
                if(groupInfo.IS_MULTIPLE){
                  answer = quiz_responses.filter((m) => { return m.QUESTION_ID == question._id; });

                }else{
                  const itemFound = quiz_responses.find((m) => { return m.QUESTION_ID == question._id; })
                  answer = [itemFound  || " "];
                }

                if (answer.length > 0) {
                  question.ANSWER = JSON.parse(
                    JSON.stringify(
                      answer.map((m) => {
                        return m.ANSWER;
                      })
                    )
                  );
                  question.ANSWER_ID = JSON.parse(
                    JSON.stringify(
                      answer.map((m) => {
                        return m._id;
                      })
                    )
                  );
                }
              }
            }
          }
        }

        let quiz = {
          templates: form_template,
          titles: page_titles,
          finalized: finalized
        };

        this.logger.info(
          `controller:search.controller:getPesquisaResult:Quiz: ${quiz}`
        );
        return quiz;
      },
    };
    return await searchByOpcao[opcao].call(this);
  }
};
