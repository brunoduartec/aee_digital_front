const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
const config = require("../env.json")[env];

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
    this.fileName = `./resources/${config.users.pass}.xlsx`;
    this.parser = parser;

    this.cache = {};
  }

  async generatePassCache() {
    const schema = require("../resources/schema")();
    let excel = await this.xlsReader(this.fileName, { schema });
    let objects = excel.rows;

    for (let index = 0; index < objects.length; index++) {
      const row = objects[index];

      const centro = row.centro;

      this.cache[centro.user] = {
        curto: centro.curto,
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

  getPassInfoByScope(user, pass, userInfo){

    let params;
    if(userInfo.centro_id){
      params = {
        user: user,
        pass: pass,
        groups: ["presidente"],
        scope_id: userInfo.centro_id,
      };
    }
    else if( userInfo.regional_id){
      params = {
        user: user,
        pass: pass,
        groups: ["coord_regional"],
        scope_id: userInfo.regional_id,
      };
    }else if(userInfo.admin){
      params = {
        user: user,
        pass: pass,
        groups: ["admin"],
        scope_id: "*",
      };
    }else if(userInfo.alianca){
      params = {
        user: user,
        pass: pass,
        groups: ["coord_geral"],
        scope_id: "*",
      };
    }

    return params;
  }

  async initUserInfo(loginInfo) {
    let { user, pass } = loginInfo;
    const cache = this.cache[user];
    let userInfo;

    if (cache) {
      try {
        userInfo = await this.userinfocontroller.initializeUserInfo(cache);
        let params = this.getPassInfoByScope(user, pass, userInfo);
      
        const passInfo = await this.trabalhocontroller.postPass(params);
        return passInfo[0];
      } catch (error) {
        return;
      }
    }
  }

  async authenticate(loginInfo) {
    let auth = await this.checkUserPass(loginInfo.user, loginInfo.pass);
    let permissions;

    if (!auth) {
      auth = await this.initUserInfo(loginInfo);
    }

    if (auth) {
      permissions = await this.getUserPermissions(auth);
    }
    return permissions;
  }
};
