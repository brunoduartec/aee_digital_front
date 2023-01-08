const config = require("../helpers/config");

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

    this.xlsReader = reader;
    this.groups = require("../resources/groups.json");
    this.permissions = require("../resources/permissions.json");
    this.fileName = `./resources/${config.users.pass}.xlsx`;
    this.parser = parser;

    this.cache = {};
  }

  async generatePassCache() {
    const schema = require("../resources/schema")();
    let excel = await this.xlsReader(this.fileName, {
      schema
    });
    let objects = excel.rows;

    for (let index = 0; index < objects.length; index++) {
      const row = objects[index];

      const centro = row.centro;

      this.cache[centro.user] = {
        user: centro.user,
        pass: centro.pass,
        curto: centro.curto,
        centro: centro.nome,
        regional: centro.regional,
      };
    }

    this.logger.info(
      `controller:auth.controller:generatePassCache => End generate cache`
    );
  }

  async checkUserPass(user, pass) {
    const params = {
      user: user,
      pass: pass,
    };

    const paramsParsed = this.parser.getParamsParsed(params);
    const auth = await this.trabalhocontroller.getPassByParams(paramsParsed);

    let userPass = auth[0];

    if (!auth[0]) {
      userPass = this.getPassInfoByCache(user, pass);
    }

    return userPass;
  }

  async getUserPermissions(auth) {
    // this.logger.info(
    //   `controller:auth.controller:getUserPermissions: ${JSON.stringify(auth)}`
    // );
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

  getPassInfoByCache(user, pass) {
    try {
      if (this.cache[user] ?.pass === pass) {
        return this.cache[user];
      }
      return;
    } catch (error) {
      this.logger.error(
        `controllers:authcontroller: getPassInfoByCache => ${error}`
      );
      throw error;
    }
  }

  getPassInfoByCentroCurtoRegional(centro, curto, regional) {
    const values = Object.values(this.cache);

    let info = values.find((m) => {
      return m.curto === curto && m.regional === regional;
    });

    return this.cache[info.user];
  }

  getPassGroupByPattern(userInfo) {
    let groups = [];
    let {
      centro,
      regional
    } = userInfo;
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
    let {
      centro_id,
      regional_id,
      admin,
      alianca
    } = userInfo;
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

  getPassInfoByScope(userInfo) {
    let params = {
      user: userInfo ?.user,
      pass: userInfo ?.pass,
      groups: this.getPassGroupByPattern(userInfo),
      scope_id: this.getScopeIdByPattern(userInfo),
    };

    return params;
  }

  async initUserInfo(loginInfo) {
    try {
      // this.logger.info(
      //   `controller:auth.controller:initUserInfo: Init User Info: ${JSON.stringify(
      //     loginInfo
      //   )}`
      // );

      let passInfo = await this.trabalhocontroller.getPassByParams(
        this.parser.getParamsParsed({
          user: loginInfo ?.user,
          pass: loginInfo ?.pass,
        })
      );

      if (passInfo.length == 0) {
        let params = this.getPassInfoByScope(loginInfo);
        passInfo = await this.trabalhocontroller.postPass(params);
      }
      return passInfo[0];
    } catch (error) {
      this.logger.error(`Error Init User Info: ${error}`);
      throw error;
    }
  }

  async getLoginHint(info) {
    let loginHint = {
      centro: info.centro || "*",
      regional: info.regional || "*",
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
        auth = await this.initUserInfo(auth);
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