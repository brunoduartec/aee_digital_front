/* eslint-disable no-undef */
const bootstrap = require("./bootstrap");
(async () => {
  await bootstrap.initialize();
})();
const http = require("http");

const server = require("./server")();
const logger = require("./helpers/logger");

const config = require("./helpers/config");

const port = process.env.PORT || config.port;

let server_http = http.Server(server);
server_http.listen(port, "0.0.0.0", function () {
  logger.info(`index:server is running on port: ${port}`);
});
