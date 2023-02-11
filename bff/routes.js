var express = require("express");
var router = express.Router();

const logger = require("./helpers/logger");
const parser = require("./helpers/parser");

const regionalController = require("./controllers/regional.controller");
const regionalcontroller = new regionalController();

const trabalhosController = require("./controllers/trabalhos.controller");
const trabalhoscontroller = new trabalhosController();

const ExcelExportResponses = require("./controllers/excelexportresponses.controller");
const excelExporterHelper = require("./helpers/excelexporter.helper");
const excelexporter = new excelExporterHelper();

const excelexporteresponses = new ExcelExportResponses(
    excelexporter,
    trabalhoscontroller
);

(async () => {
    await excelexporteresponses.init();
    logger.info("INITED");
})();

const {
    requireAuth
} = require("./helpers/auth.helpers");


router.get('/healthcheck', (req, res) => {
    const message = 'The service is up and running.'
    logger.info(message)
    res.status(200).json({
        message
    });
});

router.get("/coord_responses", async function (req, res, next) {
    const centroId = req.query.centroID;

    logger.info(`Received centroId ${centroId}`)
    try {

        const templates = [];
        if (!centroId) {
            res.json(templates);
            return
        }

        logger.info("FUEN")

        let coord_quiz = await trabalhoscontroller.getQuizTemplateByParams({
            CATEGORY: "Coordenador",
        });

        coord_quiz = coord_quiz[0]

        let coordresponse = await trabalhoscontroller.getQuizResponseByParams({
            CENTRO_ID: centroId,
            QUIZ_ID: coord_quiz._id,
            fields: "QUESTION_ID,_id,ANSWER"
        });

        for (const question of coord_quiz.QUESTIONS[0].GROUP) {
            let response = coordresponse.filter((m) => {
                return m.QUESTION_ID == question._id;
            });

            response = response[0];

            if (!response) {
                response = await setQuizResponse(
                    centroId,
                    coord_quiz._id,
                    question._id,
                    " "
                );
                if (response) {
                    response = response[0];
                }
            }

            if (response) {
                templates.push({
                    ANSWER_ID: response._id,
                    ANSWER: response.ANSWER,
                    _id: response.QUESTION_ID,
                    PRESET_VALUES: question.PRESET_VALUES,
                });
            }
        }

        res.json({
            templates
        });
    } catch (error) {
        logger.error(`get:coord_responses ${centroId}: ${error}`);
        next(error)
    }
});

router.get("/centros", async function (req, res, next) {
    try {
        const regionalName = req.query.regionalName;

        let centros;
        if (regionalName) {
            centros = await regionalcontroller.getCentroByParam({
                "REGIONAL.NOME_REGIONAL": regionalName
            });
        } else {
            centros = await regionalcontroller.getCentros();
        }

        res.json(centros);
    } catch (error) {
        this.logger.error(`/centros: ${error}`);
        next(error)
    }
});

router.get("/regional", async function (req, res, next) {
    try {
        const regionalName = req.query.regionalName;

        logger.info(`Regional:${regionalName}`)

        let regionaisInfo;
        if (!regionalName) {
            regionaisInfo = await regionalcontroller.getRegionais();
        } else {

            regionaisInfo = await regionalcontroller.getRegionalByParams({
                NOME_REGIONAL: regionalName,
            });
        }

        res.json(regionaisInfo);
    } catch (error) {
        this.logger.error(`/regional: ${error}`);
        next(error)
    }
});

router.get("/generalinfo", async function (req, res, next) {
    try {
        let {
            start,
            end
        } = req.query;
        const passes = await trabalhoscontroller.getPasses();
        let responses = await trabalhoscontroller.getSummaries(start, end);
        const centros = await regionalcontroller.getCentros();

        res.json({
            passes: passes,
            responses: responses,
            centros: centros,
        });
    } catch (error) {
        this.logger.error(`/generalinfo: ${error}`);
        next(error)
    }
});

router.get("/coord_info", async function (req, res, next) {
    try {
        const regional_id = req.query.ID;

        const regionalInfo = await regionalcontroller.getRegionalByParams( { _id: regional_id } );

        let coord_quiz = await trabalhoscontroller.getQuizTemplateByParams({
            CATEGORY: "Coordenador",
        });

        let coordenador = await trabalhoscontroller.getPessoaByParams({
            _id: regionalInfo.COORDENADOR_ID,
        });

        res.json({
            regional: regionalInfo,
            coordenador: coordenador,
            coord_quiz: coord_quiz,
        });
    } catch (error) {
        this.logger.error(`/coord_info: ${error}`);
        next(error)
    }
});

router.get("/situacao", async function (req, res, next) {
    try {
        const nomeRegional = req.query.regionalName;

        const centros = await regionalcontroller.getCentroByParam({
            "REGIONAL.NOME_REGIONAL": nomeRegional
        });

        const centroIDs = centros.map((m) => {
            return m._id;
        });

        let question = await trabalhoscontroller.getQuestionByParams({
            QUESTION: "Situação",
        });

        question = question[0];

        const situacoes = {
            centros: centros,
            summary: [],
            Integradas: [],
            Inscritas: [],
        };
        for (const id of centroIDs) {
            let summary = await trabalhoscontroller.getQuizSummaryByParams({
                CENTRO_ID: id,
            });
            summary = summary[0];

            if (summary) {
                situacoes.summary.push(summary);
            }

            let situacao = await trabalhoscontroller.getQuizResponseByParams({
                CENTRO_ID: id,
                QUESTION_ID: question._id,
                fields: "ANSWER,_id"
            });
            situacao = situacao[0];
            if (situacao) {
                if (situacao.ANSWER == " ") {
                    situacao.ANSWER = question.PRESET_VALUES[0];
                }

                if (situacao.ANSWER == question.PRESET_VALUES[0])
                    situacoes.Integradas.push(situacao);
                else {
                    situacoes.Inscritas.push(situacao);
                }
            }
        }

        res.json(situacoes);
    } catch (error) {
        this.logger.error(`/situacao: ${error}`);
        next(error)
    }
});

router.get("/summaries", async function (req, res, next) {
    try {
        const response = await trabalhoscontroller.getSummaries();
        res.json(response);
    } catch (error) {
        this.logger.error(`/summaries: ${error}`);
        next(error)
    }
});

router.get("/summary", async function (req, res, next) {
    try {
        const centroID = req.query.centroID;

        const response = await trabalhoscontroller.getQuizSummaryByParams({
            CENTRO_ID: centroID,
        });

        res.json(response);
    } catch (error) {
        this.logger.error(`/summary: ${error}`);
        next(error)
    }
});

router.get("/answerbyregional", async function (req, res, next) {
    try {
        const questionId = req.query.questionId;
        const regionalName = req.query.regionalName;

        const questionAnswers = await trabalhoscontroller.getQuizResponseByParams({
            "QUESTION_ID": questionId,
            fields: "ANSWER,_id,CENTRO_ID"
        });

        const centros = await regionalcontroller.getCentroByParam({
            "REGIONAL.NOME_REGIONAL": regionalName
        });

        let questionResponses = {};

        for (const centro of centros) {
            questionResponses[centro._id] = questionAnswers.find((m) => {
                return m.CENTRO_ID === centro._id;
            });
        }

        res.json(questionResponses);
    } catch (error) {
        this.logger.error(`/answerbyregional: ${error}`);
        next(error)
    }
});

router.get("/exportcentroresponses", async function (req, res, next) {
    try {
        const centroId = req.query.centroId;

        const fileSaved = await excelexporteresponses.exportCentro(centroId);

        res.send({
            status: "success",
            message: "file successfully downloaded",
            fileName: `${fileSaved}`,
        });
    } catch (error) {
        logger.error(`/exportcentroresponses: ${error}`);
        next(error)
    }
});

router.get("/exportregionalresponses", async function (req, res, next) {
    try {
        const regionalName = req.query.regionalName;

        const fileSaved = await excelexporteresponses.exportRegional(regionalName);

        res.send({
            status: "success",
            message: "file successfully downloaded",
            fileName: `${fileSaved}`,
        });
    } catch (error) {
        logger.error(`/exportregionalresponses: ${error}`);
        next(error)
    }
});

router.get("/exportrgeneralresponses", async function (req, res, next) {
    try {
        const fileSaved = await excelexporteresponses.exportAll();

        res.send({
            status: "success",
            message: "file successfully downloaded",
            fileName: `${fileSaved}`,
        });
    } catch (error) {
        logger.error(`/exportrgeneralresponses: ${error}`);
        next(error)
    }
});

router.post("/initialize_centro", async function (req, res, next) {
    try {
        const centroId = req.query.centroId;

        if (!centroId)
            throw new Error("centroId required")

        let responses = await trabalhoscontroller.getQuizResponseByParams({
            CENTRO_ID: centroId,
        });


        if (responses.length == 0) {
            const cadastroFormName = "Cadastro de Informações Anual";

            let form = await trabalhoscontroller.getFormByParams({
                "NAME": cadastroFormName
            });

            form = form[0];
            let pages = form.PAGES;

            let answersToAdd = []

            pages.forEach(page => {
                const quizes = page.QUIZES;

                quizes.forEach((quiz) => {
                    const questions = quiz.QUESTIONS;
                    questions.forEach(group => {
                        let GROUP = group.GROUP
                        GROUP.forEach(question => {
                            let answerInfo = {
                                CENTRO_ID: centroId,
                                QUIZ_ID: quiz._id,
                                QUESTION_ID: question._id,
                                ANSWER: " ",
                            };

                            answersToAdd.push(answerInfo)
                        })
                    })

                })

            });


            const answersAdded = await trabalhoscontroller.postQuizResponse(answersToAdd);

            res.json({
                "message": "Adicionados",
                responses: answersAdded
            });
        }
    } catch (error) {
        logger.error(`/initialize_centro: ${error}`);
        next(error)
    }
});

router.get("/get_required", async function (req, res, next) {
    try {
        const centroId = req.query.centroID;

        const responses = await trabalhoscontroller.getQuizResponseByParams({
            CENTRO_ID: centroId,
            fields: "ANSWER, QUESTION_ID"
        });

        let questions = await trabalhoscontroller.getQuestionByParams({
            IS_REQUIRED: true,
            fields: "_id, QUESTION"
        })

        let not_finished = [];

        questions.forEach(question => {
            const hasResponse = responses.find((response) => {
                return response.QUESTION_ID == question._id && response.ANSWER.trim().length > 0
            })

            if (!hasResponse) {
                not_finished.push(question.QUESTION)
            }

        });

        res.json(not_finished);
    } catch (error) {
        this.logger.error(`/get_required: ${error}`);
        next(error)
    }
});

router.delete("/remove_answer", requireAuth, async function (req, res, next) {
    try {
        const answer = req.originalUrl;
        let paramsFrom = parser.getQueryParamsParsed(answer);
        let removedItem = 0

        let quizResponse = await trabalhoscontroller.getQuizResponseByParams({
            "QUESTION_ID": paramsFrom.questionId,
            CENTRO_ID: paramsFrom.centroId
        });

        if (quizResponse.length > 1) {
            const removed = await trabalhoscontroller.deleteQuizResponseByParams({
                _id: paramsFrom.answerId,
                CENTRO_ID: paramsFrom.centroId,
            });
            removedItem = removed.deletedCount;
        }

        res.json({
            removedItems: removedItem
        });
    } catch (error) {
        this.logger.error(`/remove_answer: ${error}`);
next(error)    }
});

function getDefaultValue(question) {
    return question.PRESET_VALUES.length > 0 ? question.PRESET_VALUES[0] : " ";
}

router.post("/add_answer", requireAuth, async function (req, res, next) {
    try {
        const answer = req.originalUrl;
        let paramsFrom = parser.getQueryParamsParsed(answer);

        const groupQuestion = await trabalhoscontroller.getGroupQuestionByParams({
            _id: paramsFrom.groupId,
        });

        const questions = groupQuestion[0].GROUP;

        let response = [];

        for (let index = 0; index < questions.length; index++) {
            const question = questions[index];

            const params = {
                CENTRO_ID: paramsFrom.centroId,
                QUIZ_ID: paramsFrom.quizId,
                QUESTION_ID: question._id,
                ANSWER: getDefaultValue(question),
            };
            const quizResponse = await trabalhoscontroller.postQuizResponse(params);
            response.push(quizResponse[0]);
        }

        res.json(response);
    } catch (error) {
        this.logger.error(`/add_answer: ${error}`);
        next(error)
    }
});

router.put("/update_answer", requireAuth, async function (req, res, next) {
    try {
        const answer = req.originalUrl;
        let paramsFrom = parser.getQueryParamsParsed(answer);

        const quizResponse = await trabalhoscontroller.putQuizResponse({
            _id: paramsFrom.answerId,
        }, {
            ANSWER: paramsFrom.answer,
        });



        res.json(quizResponse);
    } catch (error) {
        this.logger.error(`/update_answer: ${error}`);
        next(error)
    }
});

async function setQuizResponse(centroID, quizID, questionID, ANSWER) {
    try {
        let answewrInfo = {
            CENTRO_ID: centroID,
            QUIZ_ID: quizID,
            QUESTION_ID: questionID,
            ANSWER: ANSWER,
        };
        let response = await trabalhoscontroller.postQuizResponse(answewrInfo);
        response = response[0];
        return response;
    } catch (error) {
        logger.error(`setQuizResponse ${error}`);
        next(error)
    }
}

module.exports = router;