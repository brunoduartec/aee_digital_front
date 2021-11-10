module.exports = class authController {
  constructor() {
    this.passes = require("../resources/pass.json");
    this.groups = require("../resources/groups.json");
    this.permissions = require("../resources/permissions.json");
  }

  async checkUserPass(user, pass) {
    const auth = this.passes.find((m) => {
      return m.user == user && m.pass == pass;
    });

    return auth;
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
    };
  }

  async authenticate(loginInfo) {
    const auth = await this.checkUserPass(loginInfo.user, loginInfo.pass);
    const permissions = await this.getUserPermissions(auth);
    return permissions;
  }
};
