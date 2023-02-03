var express = require("express");
var router = express.Router();

const { requireAuth } = require("../helpers/auth.helpers");

const regionalController = require("../controllers/regional.controller");
const regionalcontroller = new regionalController();

const TrabalhoController = require("../controllers/regional.controller");
const trabalhocontroller = new TrabalhoController();

const SearchController = require("../controllers/search.controller");
const searchcontroller = new SearchController(
  regionalcontroller,
  trabalhocontroller
);

const logger = require("../helpers/logger");

router.get("/centros", requireAuth, async function (req, res) {
  const regionalName = req.query.regionalName;
  let regionals;
  let centros;
  
  if (regionalName != null) {
    centros = await regionalcontroller.getCentroByParam({"REGIONAL.NOME_REGIONAL": regionalName});
    regionals = [
      {
        NOME_REGIONAL: regionalName,
      },
    ];
  } else {
    centros = await regionalcontroller.getCentros();
    regionals = await regionalcontroller.getRegionais();

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

router.post("/update_centro", requireAuth, async function (req, res) {
  // const centroInfo = {
  //   NOME_CENTRO: req.body.nome,
  //   NOME_CURTO: req.body.NOME_CURTO,
  //   CNPJ_CENTRO: req.body.cnpj,
  //   DATA_FUNDACAO: req.body.fundacao,
  //   ENDERECO: req.body.endereco,
  //   CEP: req.body.cep,
  //   BAIRRO: req.body.bairro,
  //   CIDADE: req.body.cidade,
  //   ESTADO: req.body.estado,
  //   PAIS: req.body.pais,
  // };

  res.render("pages/detalhe", {});
});

router.get("/pesquisar", requireAuth, async function (req, res) {
  const regionais = await regionalcontroller.getRegionais();

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
