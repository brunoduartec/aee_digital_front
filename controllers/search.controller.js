const { param } = require("jquery");

module.exports = class SearchController {
  constructor(regionalcontroller, trabalhocontroller) {
    this.regionalcontroller = regionalcontroller;
    this.trabalhocontroller = trabalhocontroller;
  }

  getParamsParsed(params) {
    let paramsParsed = "";

    let keys = Object.keys(params);

    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      const value = params[key];

      if(value){
        paramsParsed = paramsParsed.concat(`&${key}=${value}`);
      }
    }

    return paramsParsed.substring(1);
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
        const centro = await regionalcontroller.getCentroByParam({
          NOME_CURTO: search,
        });
        let centros = {
          amount: centro ? centro.length : 0,
          items: centro,
        };
        return centros;
      },
      Centro_Summary: async function () {
        let centroInfo = [];
        centroInfo.push(
          await regionalcontroller.getCentroByParam({
            NOME_CURTO: centro,
          })
        );
        const centro_id = centroInfo[0].ID;

        let paramsParsed = this.getParamsParsed({
          CENTRO_ID: centro_id,
        });

        let centroSummary = {};
        const summary =
          await trabalhocontroller.getAtividadesCentroSummaryByParams(
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

          let paramsParsed = this.getParamsParsed({
            CENTRO_ID: centro_id,
            "ATIVIDADE.NOME_ATIVIDADE": trabalho != "Todos" ? trabalho : null,
          });

          let atividade = await trabalhocontroller.getAtividadesCentroByParams(
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

        return atividades;
      },
      Regional: async function (s) {
        const centros = await regionalcontroller.getCentros();
        let regional = {
          amount: centros.length,
          items: centros,
        };
        return regional;
      },

      Quiz: async function (s) {
        let name = search.name;
        let centro_id = search.id;

        let paramsParsed = this.getParamsParsed({
          NAME: name,
        });

        let form_template = await trabalhocontroller.getFormByParams(
          paramsParsed
        );

        form_template = form_template[0];
        let pages = form_template.PAGES;
        let page_titles = [];


        for (let index = 0; index < pages.length; index++) {
          const page = pages[index];
          page_titles.push(page.PAGE_NAME);
          
          let quizes = page.QUIZES;
          for (let index = 0; index < quizes.length; index++) {
            const quiz = quizes[index];
  
            paramsParsed = this.getParamsParsed({
              CENTRO_ID: centro_id,
              QUIZ_ID: quiz._id,
            });
  
            const quiz_responses =
              await trabalhocontroller.getQuizResponseByParams(paramsParsed);
  
  
            let questions = quiz.QUESTIONS;
  
            for (let j = 0; j < questions.length; j++) {
              const question = questions[j];
              let answer = quiz_responses.find(
                (m) => m.QUESTION_ID == question._id
              );
  
              if (answer) {
                question.ANSWER = answer.ANSWER;
              }
            }
          }
        }

        let quiz = {
          templates: form_template,
          titles: page_titles
        };
        return quiz;
      },
    };
    return await searchByOpcao[opcao].call(this);
  }
};
