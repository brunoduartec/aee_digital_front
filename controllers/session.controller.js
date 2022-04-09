const crypto = require("crypto");

module.exports = class SessionController {
    constructor() {
        const instance = this.constructor.instance;
        if (instance) {
          return instance;
        }
    
        this.constructor.instance = this;
        this.authTokens = {}
    }

    generateAuthToken = () => {
        return crypto.randomBytes(30).toString("hex");
    };

    getAuthToken(key){
        return this.authTokens[key]
    }

    setAuthToken(key, value) {
        this.authTokens[key] = value
    }

    clearAuthToken(key) {
        this.authTokens[key] = null;
    }

}