module.exports = class authController {
  constructor(
    logger,
    reader,
    trabalhocontroller,
    regionalcontroller,
    userinfocontroller,
    parser
  ) {
    this.logger = logger;
    this.trabalhocontroller = trabalhocontroller;
    this.regionalcontroller = regionalcontroller;
    this.userinfocontroller = userinfocontroller;

    this.xlsReader = reader;
    this.groups = require("../resources/groups.json");
    this.permissions = require("../resources/permissions.json");
    this.fileName = "./resources/Senhas.xlsx";
    this.parser = parser;

    this.cache = {};
  }

  async generatePassCache() {
    const schema = require("../schema")();
    let excel = await this.xlsReader(this.fileName, { schema });
    let objects = excel.rows;

    for (let index = 0; index < objects.length; index++) {
      const row = objects[index];

      const centro = row.centro;

      this.cache[centro.user] = {
        centro: centro.nome,
        regional: centro.regional,
      };
    }

    this.logger.info("End generate cache");
  }

  async checkUserPass(user, pass) {
    const params = {
      user: user,
      pass: pass,
    };

    const paramsParsed = this.parser.getParamsParsed(params);
    const auth = await this.trabalhocontroller.getPassByParams(paramsParsed);

    return auth[0];
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

  async initUserInfo(auth) {
    const cache = this.cache[auth.user];

    if (cache) {
      await this.userinfocontroller.initializeUserInfo(cache);
    }
  }

  async authenticate(loginInfo) {
    const auth = await this.checkUserPass(loginInfo.user, loginInfo.pass);
    let permissions;
    if (auth) {
      permissions = await this.getUserPermissions(auth);
      await this.initUserInfo(auth);
    }
    return permissions;
  }
};
