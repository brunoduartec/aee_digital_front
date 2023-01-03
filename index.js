/* eslint-disable no-undef */

const Cache = require("./helpers/cache");
const cache = new Cache();
const logger = require("./helpers/logger");

cache.on('connected', async ()=>{
  logger.info("Start Initializing Controllers")
  const bootstrap = require("./bootstrap");
  await bootstrap.initialize();
} )

cache.connect();

const http = require("http");

const server = require("./server")();


const config = require("./helpers/config");

const port = process.env.PORT || config.port;

let server_http = http.Server(server);
server_http.listen(port, "0.0.0.0", function () {
  logger.info(`index:server is running on port: ${port}`);
});
