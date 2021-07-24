module.exports = class SearchController{
    constructor(regionalcontroller, trabalhocontroller){
        this.regionalcontroller = regionalcontroller
        this.trabalhocontroller = trabalhocontroller
    }

    async getPesquisaResult(pesquisaInfo){
        const regionalcontroller = this.regionalcontroller
        const trabalhocontroller = this.trabalhocontroller

        const regional = pesquisaInfo.regional
        const trabalho = pesquisaInfo.trabalho
        const search = pesquisaInfo.search
        const opcao = pesquisaInfo.option

        const searchByOpcao = {
          "Centro": async function(s){
            const centro = await regionalcontroller.getCentroByParam({NOME_CURTO: search})
            return centro;
          },
          "Trabalho": async function(s){
            let centros;
            if(regional != "Todos"){
              centros = await regionalcontroller.getCentrosByRegional(regional)
            }
            else{
              centros = await regionalcontroller.getCentros();
            }

            let atividades = []

            for (let index = 0; index < centros.length; index++) {
              const centro = centros[index];
              const centro_id = centro.ID
              let paramsParsed = `CENTRO_ID=${centro_id}`
              if(trabalho != "Todos"){
               paramsParsed = paramsParsed + `&ATIVIDADE.NOME_ATIVIDADE=${trabalho}` 
              }

              let atividade = await trabalhocontroller.getAtividadesCentroByParams(paramsParsed);
              
              for (let index = 0; index < atividade.length; index++) {
                let element = atividade[index];
                element.NOME_CENTRO = centro.NOME_CENTRO
                element.REGIONAL = centro.REGIONAL.NOME_REGIONAL
              }
              if(atividade && atividade.length>0){
                atividades.push(atividade);
              }
            }

            return atividades;
          },
          "Regional": async function(s){
            const centros = await regionalcontroller.getCentros()
            return centros;
          }
        }
        return await searchByOpcao[opcao].call(this);
      }


}