/**
 * @name search-v1-api
 * @description This module packages the public search apis to the user
 */
'use strict';
const hydraExpress = require('hydra-express');
const hydra = hydraExpress.getHydra();
const express = hydraExpress.getExpress();
const ServerResponse = require('fwsp-server-response');


let serverResponse = new ServerResponse();
serverResponse.enableCORS(true);express.response.sendError = function(err) {
  serverResponse.sendServerError(this, {result: {error: err}});
};
express.response.sendOk = function(result) {
  serverResponse.sendOk(this, {result});
};

let api = express.Router();

const SERVICE_NAME = "shina-api-gateway-service:/";


/**
 * Root search route -/v1/shina-api-gateway/search
 */
api.get('/', (req, res) => {
    if(!req.query.services ){
        return res.sendError({
            error: {
                code: 'invalid-argument',
                message: 'Invalid arguments in services query'
            }
        })
    }

    const acceptedServices = ['long_term_storage', 'short_term_storage'];

    let services = req.query.services.split(',') || [];
    if(!services.every(s => acceptedServices.includes(s))){
        services = services.filter(x => acceptedServices.includes(x) ) || [...acceptedServices];
    }

    const query = {
        services
    };



    // Create a message to services in own thread 
    const message = hydra.createUMFMessage({
        to: 'shina-search-service:/',
        from: SERVICE_NAME,
        body: {
            type: 'search',
            query,
            options: {
                getServices: Boolean(req.query.getServices)
            },
            config: {}
        }
    });

    hydra.sendMessage(message);

    const requestWarehousePromise = function(){
        return new Promise((resolve, reject) => {
            hydra.on('message', message => {
                // Expect warehouses to be in message
                const {bdy} = message;
                if(bdy.status === 'success'){
                    resolve({warehouses: bdy.warehouses, services: req.query.getServices ? bdy.services: []})
                }
    
                // Handle the errors 
                const {error} = bdy;
                reject(error);
            })
        });
    }  

    const serverError = function(){
        // Past request 
        return res.sendError({
            error: {
                code: '505',
                message: 'There was an internal server error'
            }
        });
    }


    requestWarehousePromise()
            .then(({warehouses, services}) => {
                // Send the warehouses back to client 
                res.sendOk({warehouses, services});
            }).catch(error => {
                switch(error.code){
                    case 'auth/not-trusted': {
                        res.sendError("Request denied. You cannot access that resource.", error);
                        break;
                    }
                    case 'query/invalid-query':{
                        // Retry the request if max repeat has not been reached 
                        res.sendError("Query has invalid data. ", error);
                        break;
                    }
                    default: {
                        return serverError();
                    }
                }
            })
    
});

module.exports = api;

