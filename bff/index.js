// arquivo app.js

const config = require("./helpers/config")
const express = require('express');
const app = express();
const logger = require("./helpers/logger");

const port = config.port
const bootstrap = require("./bootstrap");
(async () => {
  await bootstrap.initialize();
})();

app.use((req, res, next) => {
  logger.info(`Route ${req.url} was called`);
  next();
});

const routes = require('./routes');
app.use(routes);

app.listen(port, () => {
  logger.info(`API listening on port ${port}!`);
});