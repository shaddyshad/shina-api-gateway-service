/**
 * @name bills-v1-api
 * @description This module packages the public billing apis to the user
 */
'use strict';
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


/**
 * Create a new quote document and retrieve the data to the user
 */
api.post('/new', (req, res) => {
    const quoteData = req.body;

    const {warehouseId, userId, type, quoteType, cycle, endDate, startDate, units} = quoteData;


    if(!warehouseId){
        console.log("Warehouse id missing ", warehouseId);
        return res.sendError({
            error: {
                code: 'invalid-argument/warehouseId',
                message: 'Invalid or undefined warehouse id'
            }
        })
    }

    if(!userId){
        console.log("User id missing ", userId);
        return res.sendError({
            error: {
                code: 'invalid-argument/userId',
                message: 'Invalid or undefined user id'
            }
        })
    }

    if(!startDate){
        console.log("Start missing ", startDate);
        return res.sendError({
            error: {
                code: 'invalid-argument/startDate',
                message: 'Invalid or undefined start date'
            }
        })
    }

    if(!units){
        console.log("Units missing ", units);
        return res.sendError({
            error: {
                code: 'invalid-argument/units',
                message: 'Invalid or undefined units'
            }
        })
    }

    const message = hydra.createUMFMessage({
        to: SHINA_BILLING,
        from: SERVICE_NAME,
        body: {
            type: 'new',
            quoteType: type || quoteType,
            startDate,
            endDate,
            cycle,
            warehouseId,
            units,
            userId
        }
    });



    // send a message 
    hydra.sendMessage(message);

    // Promise to retrieve a new bill
    const getNewBill = function(){
        return new Promise((resolve, reject) => {
            hydra.on('message', message => {
                // Quote in body
                const {bdy} = message;
                console.log("Our body ", message);
    
                if(bdy.error){
                    reject(bdy.error);
                }
    
                resolve(bdy);
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

    getNewBill().then(quote => {
        res.sendOk(quote);
    }).catch(err => {
        switch(err.code){
            default: {
                serverError();
            }
        }
    })
});

/**
 * Retrieve a new quote given the ID
 */
api.get('/:id', (req, res) => {
    const id = req.params.id;

    if(!id){
        res.sendError({
            error: {
                code: 'invalid-argument',
                message: 'Missing quote id'
            }
        })
    }

    // Create a message to billing to retrieve the id 
    hydra.sendMessage(hydra.createUMFMessage({
        to: SHINA_BILLING,
        from: SERVICE_NAME,
        body: {
            type: 'get',
            quoteId: id
        }
    }));

    // Retrieve the quote from service
    const getQuote = function(){
        return new Promise((resolve, reject) => {
            hydra.on('message', message => {
                const {bdy} = message;

                if(bdy.error){
                    reject(bdy.error);
                }

                resolve(bdy);
            })
        })
    }

    getQuote().then(quote => {
        res.sendOk(quote)
    }).catch(err => {
        switch(err.code){
            default: {
                res.sendError({
                    error: {
                        code: 'fault',
                        message: 'An error occured in the processing'
                    }
                })
            }
        }
    })
})



module.exports = api;