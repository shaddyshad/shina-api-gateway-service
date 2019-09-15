/**
* @name Shina-api-gateway
* @summary Shina-api-gateway Hydra Express service entry point
* @description Acts as the main shina backend API gateway
*/
'use strict';

const version = require('./package.json').version;
const hydraExpress = require('hydra-express');


const HydraExpressLogger = require('fwsp-logger').HydraExpressLogger;
hydraExpress.use(new HydraExpressLogger());

let config = require('fwsp-config');

/**
* Load configuration file and initialize hydraExpress app
*/
config.init('./config/config.json')
  .then(() => {
    config.version = version;
    return hydraExpress.init(config.getObject(), version, () => {
      hydraExpress.registerRoutes({
        '/v1/shina-api-gateway/': require('./routes/api.router')
      });
    });
  })
  .then(serviceInfo => console.log('serviceInfo', serviceInfo))
  .catch(err => console.log('err', err));
