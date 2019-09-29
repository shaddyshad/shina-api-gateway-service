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

const hydraConfig = {
  environment: "production",
  hydra: {
    serviceName: "shina-api-gateway-service",
    serviceIP: "0.0.0.0",
    servicePort: 5000,
    serviceType: "shina-api-gateway",
    serviceDescription: "Acts as the main shina backend API gateway",
    plugins: {
      logger: {
        logRequests: true,
        elasticsearch: {
          host: "localhost",
          port: 9200,
          index: "hydra"
        }
      }
    },
    redis: {
      url: "104.248.165.225",
      port: 6379,
      db: 15
    }
}
}

/**
* Load configuration file and initialize hydraExpress app
*/
config.init(hydraConfig)
  .then(() => {
    config.version = version;
    return hydraExpress.init(config.getObject(), version, () => {


      hydraExpress.registerRoutes({
        '/v1/shina-api-gateway/': require('./routes/api.router')
      });
    }, registerMiddlewares);
  })
  .then(serviceInfo => console.log('serviceInfo', serviceInfo))
  .catch(err => console.log('err', err));


  /**
   * middle wares to use
   */

   function registerMiddlewares(){
     let app = hydraExpress.getExpressApp();

     app.set('port', (process.env.PORT || 5000));
   }