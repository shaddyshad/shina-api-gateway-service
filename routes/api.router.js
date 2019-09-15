/**
 * @name search-v1-api
 * @description This module packages the public search apis to the user
 */
'use strict';

const hydraExpress = require('hydra-express');
const hydra = hydraExpress.getHydra();
const express = hydraExpress.getExpress();
const ServerResponse = require('fwsp-server-response');
const billing = require('./bills-v1-api');
const search = require('./search-v1-api');
const details = require('./details-v1-api');
const ddos = require('../middlewares').ddos;
const rateLimiterMiddleware = require('../middlewares').rateLimiterMiddleware;

let serverResponse = new ServerResponse();
serverResponse.enableCORS(true);express.response.sendError = function(err) {
  serverResponse.sendServerError(this, {result: {error: err}});
};
express.response.sendOk = function(result) {
  serverResponse.sendOk(this, {result});
};

let api = express.Router();

// DDOs middlewares
api.use(ddos);
api.use(rateLimiterMiddleware)


// Handle the billing apis

api.use('/bills', billing);
api.use('/search', search);
api.use('/details', details);

api.get('/', (req, res) => {
  res.sendOk({status: 'OK'});
})

module.exports = api;

