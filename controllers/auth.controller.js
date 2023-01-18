module.exports = class authController {
  constructor(
    reader,
    trabalhocontroller,
    logger = require("../helpers/logger"),
    parser = require("../helpers/parser")
  ) {
    const instance = this.constructor.instance;
    if (instance) {
      return instance;
    }

    this.constructor.instance = this;

    this.logger = logger;
    this.trabalhocontroller = trabalhocontroller;

    this.groups = require("../resources/groups.json");
    this.permissions = require("../resources/permissions.json");
    this.parser = parser;

    this.cache = {};
  }

  async checkUserPass(user, pass) {
    const params = {
      user: user,
      pass: pass,
    };

    const paramsParsed = this.parser.getParamsParsed(params);
    const auth = await this.trabalhocontroller.getPassByParams(paramsParsed);

    let userPass = auth[0];

    return userPass;
  }

  async getUserPermissions(auth) {
    //pegar outros depois
    const userGroups = this.groups[auth.groups[0]];

    let edit = false;
    let view = false;
    let send = false;
    let summary = false;

    //melhorar essa parte
    for (let index = 0; index < userGroups.rules.length; index++) {
      const rule = userGroups.rules[index];

      if (rule.includes("edit")) {
        edit = true;
      }
      if (rule.includes("view")) {
        view = true;
      }
      if (rule.includes("send")) {
        send = true;
      }
    }

    return {
      scope_id: auth.scope_id,
      permissions: {
        view: view,
        edit: edit,
        send: send,
        summary: summary,
      },
      groups: auth.groups,
    };
  }

  getPassGroupByPattern(userInfo) {
    let groups = [];
    let { centro, regional } = userInfo;
    if (centro === "*") {
      if (regional === "*") {
        groups.push("coord_geral");
      } else {
        groups.push("coord_regional");
      }
    } else {
      groups.push("presidente");
    }
    return groups;
  }

  getScopeIdByPattern(userInfo) {
    let { centro_id, regional_id, admin, alianca } = userInfo;
    let scope_id;
    if (centro_id) {
      return centro_id;
    } else if (regional_id) {
      return regional_id;
    } else if (admin) {
      return "*";
    } else if (alianca) {
      return "*";
    }

    return scope_id;
  }

  async getLoginHint(info) {
    let loginHint = {
      centro: info.centro,
      regional: info.regional,
      curto: info.curto,
    };

    return loginHint;
  }

  async authenticate(loginInfo) {
    try {
      this.logger.info(
        `controller:auth.controller:authenticate: Start auth: ${JSON.stringify(
          loginInfo
        )}`
      );
      let auth = await this.checkUserPass(loginInfo.user, loginInfo.pass);

      if (auth) {
        let loginHint = await this.getLoginHint(auth);
        auth = await this.getUserPermissions(auth);
        auth.loginHint = loginHint;
      }

      return auth;
    } catch (error) {
      this.logger.error(
        `controller:auth.controller:authenticate: Error Authenticating: ${error}`
      );
      throw error;
    }
  }
};
