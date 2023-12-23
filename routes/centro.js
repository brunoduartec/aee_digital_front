var express = require("express");
var router = express.Router();

const { requireAuth } = require("../helpers/auth.helpers");

const Controller = require("../controllers/api.controller");
const controller = new Controller();

const SearchController = require("../controllers/search.controller");
const searchcontroller = new SearchController();

const logger = require("../helpers/logger");

router.get("/centros", requireAuth, async function (req, res) {
  const regionalName = req.query.regionalName;
  let regionals;
  let centros;
  
  if (regionalName != null) {
    centros = await controller.getCentroByParam({"REGIONAL.NOME_REGIONAL": regionalName});
    regionals = [
      {
        NOME_REGIONAL: regionalName,
      },
    ];
  } else {
    centros = await controller.getCentros();
    regionals = await controller.getRegionais();

    regionals = regionals.sort(function (a, b) {
      if (a.NOME_REGIONAL > b.NOME_REGIONAL) {
        return 1;
      }
      if (a.NOME_REGIONAL < b.NOME_REGIONAL) {
        return -1;
      }
    });
  }

  res.render("pages/centros", {
    centros: centros,
    regionais: regionals,
  });
});

router.get("/centro", requireAuth, async function (req, res) {
  try {
    const centro = req.query.nome;
    const edit = req.query.edit;
    const option = "Centro";
  
    const pesquisaInfo = {
      search: centro,
      option: option,
    };
    const result = await searchcontroller.getPesquisaResult(pesquisaInfo);
  
    if (edit) {
      res.render("pages/editar", {
        opcao: option,
        result: result.items,
      });
    } else {
      res.render("pages/detalhe", {
        opcao: option,
        result: result.items,
      });
    }
    
  } catch (error) {
    this.logger.error("Error at centro route")
    throw error;
  }
});

router.get("/trabalho_centro", requireAuth, async function (req, res) {
  const centro = req.query.nome;
  const edit = req.query.edit;
  const option = "Centro_Summary";

  const pesquisaInfo = {
    centro: centro,
    trabalho: "Todos",
    option: option,
  };
  const result = await searchcontroller.getPesquisaResult(pesquisaInfo);

  if (edit) {
    res.render("pages/editar", {
      opcao: "Trabalhos",
      result: result.items,
    });
  } else {
    res.render("pages/detalhe", {
      opcao: option,
      result: result.items,
    });
  }
});

router.get("/cadastro", requireAuth, async function (req, res) {
  const centro = req.query.nome;
  const edit = req.query.edit;
  const option = "Centro_Summary";

  const pesquisaInfo = {
    centro: centro,
    trabalho: "Todos",
    option: option,
  };
  const result = await searchcontroller.getPesquisaResult(pesquisaInfo);

  if (edit) {
    res.render("pages/editar", {
      opcao: "Trabalhos",
      result: result.items,
    });
  } else {
    res.render("pages/detalhe", {
      opcao: option,
      result: result.items,
    });
  }
});

router.post("/create_centro", requireAuth, async function (req, res) {
  try {
    const defaultValue = "  "
    const centroInfo = {
      NOME_CENTRO: req.body.nome,
      NOME_CURTO: req.body.nome_curto,
      CNPJ_CENTRO: req.body.cnpj || defaultValue,
      DATA_FUNDACAO: req.body.fundacao || "1/1/2000",
      ENDERECO: req.body.endereco || defaultValue,
      CEP: req.body.cep || defaultValue,
      BAIRRO: req.body.bairro || defaultValue,
      CIDADE: req.body.cidade || defaultValue,
      ESTADO: req.body.estado || defaultValue,
      PAIS: req.body.pais || "Brasil",
      REGIONAL: req.body.regional
    };
  
    const centroInfoAdded = await controller.createCentro(centroInfo)

    await controller.initializeCentro(centroInfoAdded.ID)

    let loginInfo = await controller.setPass(centroInfo.NOME_CENTRO, centroInfoAdded.ID, ['presidente'])
    loginInfo = loginInfo[0]

    res.render("pages/thanks", {
      centroInfoAdded,
      message:`informações do centro\nusuario: ${loginInfo.user}\n  senha:${loginInfo.pass}`
    });
  } catch (error) {
    logger.error(`post:create_centro: ${req.body}`, error);
    res.json({
      message: "",
      error
    })
  }
});

router.get("/pesquisar", requireAuth, async function (req, res) {
  const regionais = await controller.getRegionais();

  res.render("pages/pesquisar", {
    regionais: regionais,
  });
});

router.post("/pesquisa", requireAuth, async function (req, res) {
  let centro = [];
  try {
    const regional = req.body.regional;
    const trabalho = req.body.trabalho;
    const search = req.body.search;
    const opcao = "Trabalho";

    const pesquisaInfo = {
      regional: regional,
      trabalho: trabalho,
      search: search,
      option: opcao,
    };
    const result = await searchcontroller.getPesquisaResult(pesquisaInfo);

    if (result) {
      res.render("pages/pesquisa", {
        opcao: opcao,
        result: result,
      });
    } else {
      const opcoes = ["Centro", "Regional", "Trabalho"];

      res.render("pages/pesquisar", {
        opcoes: opcoes,
        result: null,
      });
    }
  } catch (error) {
    logger.error(`post:pesquisa: ${centro}`);
    throw error;
  }
});

module.exports = router;
