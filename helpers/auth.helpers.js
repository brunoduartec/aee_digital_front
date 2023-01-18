const parser = require("../helpers/parser");

const regionalController = require("../controllers/regional.controller");
const regionalcontroller = new regionalController();

const trabalhosController = require("../controllers/trabalhos.controller");
const trabalhoscontroller = new trabalhosController();

const authController = require("../controllers/auth.controller");
const authcontroller = new authController(trabalhoscontroller);

const SearchController = require("../controllers/search.controller");
const searchcontroller = new SearchController(
  regionalcontroller,
  trabalhoscontroller
);

const userInfoController = require("../controllers/userInfo.controller");
const userinfocontroller = new userInfoController(
  regionalcontroller,
  trabalhoscontroller,
  searchcontroller
);

const SessionController = require("../controllers/session.controller");
const sessioncontroller = new SessionController();

const pageByPermission = {
  presidente: function (info) {
    return `/cadastro_alianca?ID=${info.link}&page=0`;
  },
  coord_regional: function (info) {
    return `/summary_coord?ID=${info.link}`;
  },
  coord_geral: function () {
    return `/summary_alianca?start=1/1/2023&end=31/12/2024`;
  },
};

const requireAuth = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    req.session.originalUrl = req.originalUrl;
    res.render("pages/login", {
      message: {},
    });
  }
};

async function TryAuthenticate(req, res) {
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
    auth.scope_id = userInfo.scope_id;

    if (mustInitialize) {
      const appendInfo = {
        scope_id: userInfo.scope_id,
      };
      const paramsParsed = parser.getParamsParsed({
        user: loginInfo.user,
        pass: loginInfo.pass,
      });
      await trabalhoscontroller.updatePass(paramsParsed, appendInfo);
    }

    const authToken = sessioncontroller.generateAuthToken();

    sessioncontroller.setAuthToken(authToken, loginInfo.user);

    req.session.authToken = authToken;

    let info = {
      link: userInfo.scope_id,
    };

    req.session.auth = auth;
    res.redirect(pageByPermission[auth.groups[0]](info));
  }
}

async function TryLogout(req, res) {
  sessioncontroller.clearAuthToken(req.session.authToken);
  req.session.authToken = null;
  req.session.auth = null;
  req.session = null;

  res.redirect("/");
}

module.exports = {
  TryAuthenticate,
  TryLogout,
  requireAuth,
  pageByPermission,
};
