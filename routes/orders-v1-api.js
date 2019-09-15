const hydraExpress = require('hydra-express');
const hydra = hydraExpress.getHydra();
const express = hydraExpress.getExpress();
const ServerResponse = require('fwsp-server-response');

const SERVICE_NAME = "shina-api-gateway-service:/";
const SHINA_BILLING = "shina-billing-service:/";

let serverResponse = new ServerResponse();
serverResponse.enableCORS(true);express.response.sendError = function(err) {
  serverResponse.sendServerError(this, {result: {error: err}});
};
express.response.sendOk = function(result) {
  serverResponse.sendOk(this, {result});
};

let api = express.Router();


api.post('/new/inbound', (req, res) => {

})

module.exports = api;