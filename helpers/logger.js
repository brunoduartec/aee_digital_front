const { createLogger, format, transports } = require("winston");
// const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
// const config = require("../env.json")[env];
const config = require("./config");

const mongoConfig = config.mongo;
const connection = `mongodb://${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}`;

// Import mongodb
require("winston-mongodb");

const logger = createLogger({
  transports: [
    // File transport
    // new transports.File({
    //   filename: "logs/server.log",
    //   format: format.combine(
    //     format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
    //     format.align(),
    //     format.printf(
    //       (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
    //     )
    //   ),
    // }),

    // MongoDB transport
    new transports.MongoDB({
      // level: "error",
      //mongo database connection link
      db: connection,
      options: {
        useUnifiedTopology: true,
      },
      // A collection to save json formatted logs
      collection: "front_server_logs",
      capped: true,
      cappedMax: 2,
      format: format.combine(
        format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
        // Convert logs to a json format
        format.json()
      ),
    }),
  ],
});

module.exports = logger;
