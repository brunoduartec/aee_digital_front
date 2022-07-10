const {setTimeout} = require("timers/promises") ;


module.exports = class Repeater{
    constructor(logger){
        this.logger = logger
    }

    async delay(elapsetime) {
        this.logger.info(`helpers:repeater:delay Will wait ${elapsetime}`);
        await setTimeout(5000);
        this.logger.info(`helpers:repeater:delay Returned`);

    }

    async repeat(callback, elapsetime, condition){
        while(!condition()){
            this.logger.info(`helpers:repeater:repeat Will execute`);
            await callback();
            await this.delay(elapsetime)
        }
    }
}