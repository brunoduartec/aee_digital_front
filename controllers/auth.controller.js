module.exports = class authController {
  constructor() {}

  async checkUserPass(user, pass) {
    return user == "admin" && pass == "admin";
  }

  async authenticate(req, res, route, params) {
    if (!req.session.loggedin) {
      const loginInfo = {
        user: req.body.email,
        pass: req.body.pass
      };
      if (await this.checkUserPass(loginInfo.user, loginInfo.pass)) {
        req.session.loggedin = true;
        console.log("ROTA", route, params);
        res.render(route, params);
      }
      else{
        res.render("pages/login", { auth: false, ...loginInfo });
      }
    }else{
      console.log("ROTA", route, params);
      res.render(route, params);
    }
  }
};
