const cron = require("node-cron");

module.exports = class Repeater {
  constructor(logger = require("../helpers/logger")) {
    this.logger = logger;
  }

  async repeat(callback, elapsetime) {
    const task = cron.schedule(`*/${elapsetime} * * * *`, async () => {
      console.log(
        `running a task every ${elapsetime} minute: ${new Date().toLocaleString()}`
      );
      await callback();
    });
    return task;
  }
};
