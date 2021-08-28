module.exports = class authController {
  constructor() {}

  async checkUserPass(user, pass) {
    return user == "admin" && pass == "admin";
  }

  async authenticate(loginInfo) {
    return await this.checkUserPass(loginInfo.user, loginInfo.pass);
  }
};
