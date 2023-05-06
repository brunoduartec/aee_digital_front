module.exports = class BaseController{
    constructor(
        service = "service",
        parser = require("../helpers/parser"),
        logger = require("../helpers/logger"),
    ){
        this.service = service;
        this.parser = parser;
        this.logger = logger;

    }
}