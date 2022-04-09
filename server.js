const express = require("express");
const app = express();

var compression = require('compression')
app.use(compression())

var bodyParser = require("body-parser");

const logger = require("./helpers/logger");
const readXlsxFile = require("read-excel-file/node");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "local";
const config = require("./env.json")[env];
const parser = require("./helpers/parser");

const Request = require("./helpers/request")
const request = new Request(logger);

const regionalController = require("./controllers/regional.controller");
const regionalcontroller = new regionalController();


const trabalhosController = require("./controllers/trabalhos.controller");
const trabalhoscontroller = new trabalhosController();


const schema = require("./resources/centro_schema")();
const fileName = `./resources/${config.centros.base}.xlsx`;

const Reader = require("./helpers/reader")
const reader = new Reader(readXlsxFile, fileName, schema)

const CentroInfoController = require("./controllers/centroInfo.controller");
const centroinfocontroller = new CentroInfoController();


// This will hold the users and authToken related to users

request.addInstance("aee_digital_regionais", config.aee_digital_regionais);
request.addInstance("aee_digital_trabalhos", config.aee_digital_trabalhos);

(async ()=>{
  await regionalcontroller.initialize(logger, request, readXlsxFile)
  await centroinfocontroller.initialize(logger, reader, parser)
  await trabalhoscontroller.initialize(parser, logger, request)
})()

app.set("view engine", "ejs");
app.use(express.static("public"));

const {requireAuth, pageByPermission} = require("./helpers/auth.helpers")

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


app.use(require("./routes/login"))
app.use(require('./routes/centro'));
app.use(require('./routes/cadastro'));
app.use(require('./routes/centro'));
app.use(require('./routes/bff'));


app.get("/", requireAuth, async function (req, res) {
  const auth = req.session.auth;
  let info = {
    link: auth.scope_id,
  };
  res.redirect(pageByPermission[auth.groups[0]](info));
});


// about page
app.get("/about", function (req, res) {
  res.render("pages/about");
});

app.all("*", function (req, res) {
  res.render("pages/notfound");
});

module.exports = function () {
  return app;
};