const BaseController = require("./base.controller");

module.exports = class CacheableController extends BaseController {
    constructor({
        service = "service",
        Request = require("../helpers/request"),
        Cache = require("../helpers/cache.helpers"),
        ttl = 300
    }) {
        super(service);
        this.request = new Request();
        this.cache = new Cache(service)
        this.ttl = ttl
    }

    getFormatedName(domain, key) {
        let paramsWithDoman = `${domain}:${this.service}:${key}`
        return paramsWithDoman;
    }


    async get(domain, params) {
        try {
            let paramsParsed = this.parser.getParamsParsed(params)
            let formatedName = this.getFormatedName(domain, paramsParsed)

            let cachedValue = this.cache.get(formatedName)

            if (cachedValue) {
                return cachedValue
            } else {
                const response = await this.request.get(
                    this.service,
                    `/${domain}?${paramsParsed}`
                );

                this.cache.set(formatedName, response, this.ttl)
                return response;
            }
        } catch (error) {
            this.logger.error(
                `${this.service}:${domain}: get Error=> ${error}`
            );
            throw error;
        }
    }

    async post(domain, body) {
        try {
            this.cache.clearGroup(domain)
            const response = await this.request.post(
                this.service,
                `/${domain}`,
                body
            );
            return response;
        } catch (error) {
            this.logger.error(
                `${this.service}:${domain}: post Error=> ${error}`
            );
            throw error;
        }

    }

    async put(domain, params, body) {
        try {
            let paramsParsed = this.parser.getParamsParsed(params)
            this.cache.clearGroup(domain)

            const response = await this.request.put(
                this.service,
                `/${domain}?${paramsParsed}`,
                body
            );

            return response

        } catch (error) {
            this.logger.error(
                `${this.service}:${domain}: put Error=> ${error}`
            );
            throw error;
        }

    }

    async delete(domain, params) {
        try {
            let paramsParsed = this.parser.getParamsParsed(params)
            this.cache.clearGroup(domain)

            const response = await this.request.delete(
                this.service,
                `/${domain}?${paramsParsed}`
            );

            return response;
        } catch (error) {
            this.logger.error(
                `${this.service}:${domain}: delete Error=> ${error}`
            );
            throw error;
        }
    }


}