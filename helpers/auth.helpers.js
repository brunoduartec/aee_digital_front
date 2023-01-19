
const trabalhosController = require("../controllers/trabalhos.controller");
const trabalhoscontroller = new trabalhosController();

const authController = require("../controllers/auth.controller");
const authcontroller = new authController(trabalhoscontroller);


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
    const authToken = sessioncontroller.generateAuthToken();

    sessioncontroller.setAuthToken(authToken, loginInfo.user);

    req.session.authToken = authToken;

    let info = {
      link: auth.scope_id,
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
