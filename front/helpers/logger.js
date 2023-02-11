const { createLogger, format, transports } = require("winston");

// Import mongodb
require("winston-daily-rotate-file");

const util = require("util");

function transform(info) {
  const args = info[Symbol.for("splat")];
  if (args) {
    info.message = util.format(info.message, ...args);
  }
  return info;
}

function utilFormatter() {
  return { transform };
}

const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  utilFormatter(),
  format.colorize()
);

const fileRotateTransport = new transports.DailyRotateFile({
  filename: "logs/%DATE%-combined.log",
  datePattern: "DD-MMM-YYYY",
  level: "info",
  format: logFormat,
  maxSize: "20m",
  maxFiles: "14d",
});

const logger = createLogger({
  transports: [new transports.Console(), fileRotateTransport],
});

module.exports = logger;
