module.exports = class SearchController{
    constructor(regionalcontroller){
        this.regionalcontroller = regionalcontroller
    }

    async getPesquisaResult(opcao, search){
        const regionalcontroller = this.regionalcontroller
        const searchByOpcao = {
          "Centro": async function(s){
            const centro = await regionalcontroller.getCentroByParam({NOME_CURTO: search})
            return centro;
          },
          "Trabalho": async function(s){
            const trabalho = [{
              "NOME": "teste"
            }]
            return trabalho;
          },
          "Regional": async function(s){
            const centros = await regionalcontroller.getCentros()
            return centros;
          }
        }
        return await searchByOpcao[opcao].call(this);
      }


}