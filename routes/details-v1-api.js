/**
 * @name details-v1-api
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
 * Retrieve the warehouse details using the id 
 */
api.get('/:id', (req, res) => {
    const warehouseId = req.params.id;
    console.log("New request ", warehouseId);

    if(!warehouseId){
        res.sendError({error: 'Details require an id to be passed'});
    }

    /**
     * Authenticate user request
     */

    // Retrieve the daa
    hydra.sendMessage(hydra.createUMFMessage({
        from: SERVICE_NAME,
        to: 'shina-search-service:/',
        body: {
            type: 'details',
            id: warehouseId
        }
    }));

    // Promise to retrieve the data 
    const getWarehouseDetails = function(){
        return new Promise((resolve, reject) => {
            hydra.on('message', message => {
                // Warehouse in bdy 
                const {bdy} = message;
                if(bdy.status === 'success'){
                    resolve(bdy.warehouse)
                }

                // Handle errors 
                if(bdy.error){
                    reject(bdy.error);
                }
            })
        })
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

    getWarehouseDetails()
        .then(warehouse => {
            console.log("Is it here ", warehouse);
            res.sendOk({warehouse});
        })
        .catch(err => {
            switch(err.code){
                default: {
                    return serverError();
                }
            }
        });
});

module.exports = api;