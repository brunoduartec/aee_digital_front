const Cache = require("../helpers/cache");
const cache = new Cache();

module.exports = class IController{
    constructor(prefix, logger = require("../helpers/logger")){
        const instance = this.constructor.instance;
        if (instance) {
            return instance;
        }
        this.constructor.instance = this;

        this.cache = cache;
        this.cacheprefix = prefix;
        this.logger = logger
    }

    getKeyFormated(key){
        return `${this.cacheprefix}:${key}`
      }
}