/* eslint-disable no-undef */
require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    aee_digital_regionais: process.env.aee_digital_regionais,
    aee_digital_trabalhos: process.env.aee_digital_trabalhos
};
