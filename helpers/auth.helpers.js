const readXlsxFile = require("read-excel-file/node");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
const config = require("../env.json")[env];

const logger = require("../helpers/logger");
const parser = require("../helpers/parser");

const Request = require("../helpers/request")
const request = new Request(logger);


const schema = require("../resources/centro_schema")();
const fileName = `../resources/${config.centros.base}.xlsx`;
const Reader = require("../helpers/reader")
const reader = new Reader(readXlsxFile, fileName, schema)

const regionalController = require("../controllers/regional.controller");
const regionalcontroller = new regionalController(logger, request);

const trabalhosController = require("../controllers/trabalhos.controller");
const trabalhoscontroller = new trabalhosController(parser, logger, request);

const authController = require("../controllers/auth.controller");
const authcontroller = new authController(
  logger,
  readXlsxFile,
  trabalhoscontroller,
  parser
);

const SearchController = require("../controllers/search.controller");
const searchcontroller = new SearchController(
  regionalcontroller,
  trabalhoscontroller,
  logger,
  parser
);

const CentroInfoController = require("../controllers/centroInfo.controller");
const centroinfocontroller = new CentroInfoController();

const userInfoController = require("../controllers/userInfo.controller");
const userinfocontroller = new userInfoController(
  regionalcontroller,
  centroinfocontroller,
  trabalhoscontroller,
  searchcontroller,
  logger,
  parser
);

const SessionController = require("../controllers/session.controller")
const sessioncontroller = new SessionController();

const pageByPermission = {
    presidente: function (info) {
      return `/cadastro_alianca?ID=${info.link}&page=0`;
    },
    coord_regional: function (info) {
      return `/summary_coord?ID=${info.link}`;
    },
    coord_geral: function (info) {
      return `/summary_alianca`;
    }
  };

const requireAuth = (req, res, next) => {
    if (req.user) {
      next();
    } else {
      req.session.originalUrl = req.originalUrl;
      res.render("pages/login", {
        message: {}
      });
    }
  };

  async function TryAuthenticate(req, res, route) {
    const loginInfo = {
      user: req.body.email,
      pass: req.body.pass,
    };
  
    let auth = await authcontroller.authenticate(loginInfo);
    if (!auth) {
      res.redirect("/login?failedAuth=true");
    } else {
  
      let mustInitialize = auth.scope_id == null;
  
      const userInfo = await userinfocontroller.initializeUserInfo(auth);
      auth.scope_id = userInfo.scope_id
  
      if (mustInitialize) {
        const appendInfo = {
          scope_id: userInfo.scope_id
        }
        const paramsParsed = parser.getParamsParsed({
          user: loginInfo.user,
          pass: loginInfo.pass
        });
        await trabalhoscontroller.updatePass(paramsParsed, appendInfo)
      }
  
      const authToken = sessioncontroller.generateAuthToken();

      sessioncontroller.setAuthToken(authToken, loginInfo.user)
  
      req.session.authToken = authToken;
  
      let info = {
        link: userInfo.scope_id
      };
  
      req.session.auth = auth;
      res.redirect(pageByPermission[auth.groups[0]](info));
    }
  }

  async function TryLogout(req, res) {
    sessioncontroller.clearAuthToken(req.session.authToken)
    req.session.authToken = null;
    req.session.auth = null;
    req.session = null;
  
    res.redirect("/");
  }


module.exports = {
    TryAuthenticate,
    TryLogout,
    requireAuth,
    pageByPermission
}