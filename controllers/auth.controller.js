module.exports = class authController {
  constructor() {}

  async authenticate(user, pass) {
    return user == "admin" && pass == "admin";
  }
};
