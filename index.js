const http = require("http");

const server = require("./server")();
const logger = require("./helpers/logger");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
logger.info(`ENVIRONMENT=> ${env}`);

const config = require("./env.json")[env];

const port = process.env.PORT || config.port;

let server_http = http.Server(server);
server_http.listen(port, "0.0.0.0", function () {
  logger.info(`server is running on port: ${port}`);
});
