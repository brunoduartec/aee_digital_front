const BaseController = require("./base.controller");

module.exports = class ReportController extends BaseController {
    constructor(
        exporting_guid,
        form_alias = "Cadastro de Informações Anual",
        RegionaisController = require("./regional.controller"),
        TrabalhosController = require("./trabalhos.controller"),
        SearchController = require("./search.controller"),
    ) {
        super("ReportController")
        this.regionalcontroller = new RegionaisController();
        this.trabalhoscontroller = new TrabalhosController()
        this.searchcontroller = new SearchController();
        this.form_alias = form_alias
        this.exporting_guid = exporting_guid;
    }

    async getReportGroups() {

        try {
            let [form, coordinatorQuiz] = await Promise.all([
                await this.trabalhoscontroller.getFormByParams({
                    NAME: this.form_alias
                }),
                await this.trabalhoscontroller.getQuizTemplateByParams({
                    CATEGORY: "Coordenador",
                })
            ]);
    
            form = form[0];
    
            let coordinatorQuizGroup = coordinatorQuiz[0];
    
            this.infoResponses = form.PAGES.flatMap(page => page.QUIZES);
    
            this.infoResponses = this.infoResponses.map(m => {
                return {
                    "CATEGORY": m.CATEGORY,
                    QUESTIONS: [{
                        QUESTION: "Nome Curto"
                    }].concat(m.QUESTIONS.flatMap(group => group.GROUP))
                };
            });
    
            this.coordinatorQuestions = coordinatorQuizGroup.QUESTIONS.flatMap(group => group.GROUP);
    
            this.infoResponses.push({
                "CATEGORY": coordinatorQuizGroup.CATEGORY,
                QUESTIONS: [{
                    QUESTION: "Nome Curto"
                }].concat(this.coordinatorQuestions)
            });
            return {
                infoResponses: this.infoResponses
            };
        } catch (error) {
            throw new Error({
                message:"getReportGroups",
                error})
        }
 
    }

    async centroInfoMethod(id) {
        const pesquisaInfo = {
            search: {
                id: id,
                name: this.form_alias,
            },
            option: "Quiz",
        };
        const pesquisa = await this.searchcontroller.getPesquisaResult(pesquisaInfo);

        return pesquisa;

    }

    async getResponses(search) {
        const answers = []
        const templates = search.templates;
        templates.PAGES.forEach((page) => {
            page.QUIZES.forEach((quiz) => {
                quiz.QUESTIONS.forEach((question) => {
                    question.GROUP.forEach((group) => {
                        const answer = {
                            QUESTION_ID: group._id,
                            ANSWER: group.ANSWER
                        }
                        answers.push(answer);
                    });
                });
            });
        });

        return answers
    }

    async getCoordenadorResponses(centroResponses) {
        const responses = [];
        for (const question of this.coordinatorQuestions) {
            let response = centroResponses.find((m) => {
                return m.QUESTION_ID == question._id;
            });

            responses.push({
                QUESTION_ID: question._id,
                ANSWER: [response.ANSWER]
            })

        }
        return responses;
    }


    async createCentroMatrix(centrosResponses, nome_curto, io) {
        
        try {
            let currentRow = 1
    
            let rowsInfo = []
    
            this.infoResponses.forEach(header => {
                let rowInfo = {
                    CATEGORY: header.CATEGORY,
                    row: []
                }
    
                const cols = header.QUESTIONS.length
    
                if (!header.matrix) {
                    //alocando memoria
                    header.matrix = new Array(2);
                    for (let i = 0; i < 2; i++) {
                        header.matrix[i] = new Array(cols);
                    }
                } else {
                    const rows = header.matrix.length
                    header.matrix[rows] = new Array(cols);
                    currentRow = rows
                }
    
                header.matrix[currentRow][0] = nome_curto
                header.matrix[0][0] = "Nome Curto"
    
    
                for (let col = 1; col < cols; col++) {
                    const question = header.QUESTIONS[col]
    
                    header.matrix[0][col] = question.QUESTION
    
                    let answer = centrosResponses.filter((m) => {
                        return m.QUESTION_ID == question._id
                    })[0]
    
                    let questionAnswer = (answer && answer.ANSWER) ? answer.ANSWER.toString() : ""
                    header.matrix[currentRow][col] = questionAnswer.replace(/true/g, "sim").replace(/false/g, "não")
                }
    
                rowInfo.row = header.matrix[currentRow]
                rowsInfo.push(rowInfo)
    
            });
    
            io.emit("report_generated", {
                "event": "row_generated",
                exporting_guid: this.exporting_guid,
                rowsInfo
            });
        } catch (error) {
            throw new Error({
                message:"createCentroMatrix",
                error
            })
        }

    }

    async generateCentroReport(centroId, io) {
        const [itemSearched, centro, centroResponses] = await Promise.all([
            await this.centroInfoMethod(centroId),
            await this.regionalcontroller.getCentroByParam({
                _id: centroId
            }),
            await this.trabalhoscontroller.getQuizResponseByParams({
                CENTRO_ID: centroId
            })
        ]);

        let centrosResponses = (await this.getResponses(itemSearched)).concat(await this.getCoordenadorResponses( centroResponses))

        let nome_curto
        if (Array.isArray(centro) && centro.length > 0 && typeof centro[0] === 'object' && 'NOME_CURTO' in centro[0]) {
            nome_curto = centro[0].NOME_CURTO
        } else {
            nome_curto = centroId
        }

        await this.createCentroMatrix(centrosResponses, nome_curto, io)

    }

    async generateRegionalReport(regionalId, io) {
        let [regionalInfo] = await this.regionalcontroller.getRegionalByParams({
            _id: regionalId
        })

        const centros = await this.regionalcontroller.getCentroByParam({
            "REGIONAL._id": regionalInfo._id
        })

        Promise.all(centros.map(centro => this.generateCentroReport(centro._id, io))).then(() => {
            io.emit("end_report_generated", {
                "event": "end_generated",
                exporting_guid: this.exporting_guid
            });
        });
    }

    async generateReport(scope, scope_id, io){
        try {
            await this.getReportGroups();
            
            switch (scope) {
                case "CENTRO":
                  this.generateCentroReport(scope_id, io).then(()=>{
                  io.emit("end_report_generated",{
                    "event":"end_generated",
                    exporting_guid: this.exporting_guid
                  });
                })
                  break;
            
                case "REGIONAL":
            
                this.generateRegionalReport(scope_id, io)
                break;
            
                case "GERAL":
            
                break;
              
                default:
                  break;
              }
        } catch (error) {
            throw new Error(error)
        }
    }



}