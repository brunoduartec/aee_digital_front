const jwt = require("jsonwebtoken");

const authController = require("../controllers/auth.controller");
const authcontroller = new authController();

const tokenpass = "aeealianca"

const pageByPermission = {
  presidente: function (info) {
    return `/cadastro_alianca?ID=${info.link}&page=0`;
  },
  coord_regional: function (info) {
    return `/summary_coord?ID=${info.link}&start=1/1/2023&end=31/12/2024`;
  },
  coord_geral: function () {
    return `/summary_alianca?start=1/1/2023&end=31/12/2024`;
  },
};

const requireAuth = (req, res, next) => {
  const token = req.cookies.authToken;

  if (token) {
    try {
      const verificado = jwt.verify(token, tokenpass);
      req.user = verificado;

      next();
    } catch (error) {
      req.session.originalUrl = req.originalUrl;
      res.render("pages/login", {
        message: {},
      });
    }
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

    let info = {
      link: auth.scope_id,
    };

    req.session.auth = auth;

    const token = jwt.sign(auth,tokenpass,{expiresIn:'3d'})
    res.cookie('authToken', token, { httpOnly: true });

    res.redirect(pageByPermission[auth.groups[0]](info));
  }
}

async function TryLogout(req, res) {
  res.clearCookie('authToken');
  res.redirect("/");
}

module.exports = {
  TryAuthenticate,
  TryLogout,
  requireAuth,
  pageByPermission,
};
