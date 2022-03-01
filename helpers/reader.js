module.exports = class Reader{

    constructor(xlsReader, fileName,schema, logger){
        this.schema = schema;
        this.xlsReader = xlsReader;
        this.fileName = fileName;
        this.logger = logger
    }

    parseFuncionamento(centro){
        if(!centro.AE || !centro.funcionamento){
            return;
        }

        centro.AE.dh_ae = [];

        const funcionamento = centro.funcionamento;

        let items = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];

        let dayParser ={
            segunda: "SEGUNDA-FEIRA",
            terca: "TERÇA-FEIRA",
            quarta: "QUARTA-FEIRA",
            quinta: "QUINTA-FEIRA",
            sexta: "SEXTA-FEIRA",
            sabado: "SÁBADO",
            domingo: "DOMINGO"
        }

        try {
            for (let index = 0; index < items.length; index++) {
                const diasemana = items[index];
                const it = funcionamento[diasemana]
    
                if(it){
                    for (const horario of it) {
                        const datetime = {
                            day: dayParser[diasemana],
                            time: horario.trim()
                        }
        
                        centro.AE.dh_ae.push(datetime)
                    }
                }
            }
            
        } catch (error) {
            this.logger.error(`parseFuncionamento =>${error}`)
            throw error
        }
    }

    async Read(){
        let schema = this.schema
        let excel = await this.xlsReader(this.fileName, { schema });

        let rows = excel.rows;

        for (const row of rows) {
            this.parseFuncionamento(row.centro)
        }

        return rows
    }

}