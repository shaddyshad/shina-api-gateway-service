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
const SHINA_USERS = "shina-users-service:/";
const SEARCH_SERVICE = "shina-search-service:/";

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

    const {warehouseId, userId, type, quoteType, cycle, endDate, startDate, units, name, phoneNumber} = quoteData;

    console.log("Quote data ", quoteData);


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

    // send use details to user service
    hydra.sendMessage(hydra.createUMFMessage({
        to: SHINA_USERS,
        from: SERVICE_NAME,
        body: {
            type: 'update',
            uid: userId,
            details: {
                name, phoneNumber
            }
        }
    }));

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
            userId,
            name,
            phoneNumber
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
 * Given a user choices choose an appropriate warehouse
 */
api.get('/get_storage', (req, res) => {
    const {query} = req.query;

    console.log("Query ", query);

    // declare query
    const FURNITURE = 'furniture';
    const OTHER = 'others';
    const PACKAGED = 'packaged';

    // get the services required 
    const options = query.split(',');
    let q = {};

    // figure out what service to use
    if(options.includes(FURNITURE)){
        // prefer a long term storage
        q.services = ['long_term_storage', 'short_term_storage'];
    }
    if(options.includes(PACKAGED)){
        q.services = ['short_term_storage'];
    }
    if(options.includes(OTHER)){
        q.services = ['long_term_storage', 'short_term_storage'];
    }

    console.log("s ", q);



    // send this to search service
    hydra.sendMessage(hydra.createUMFMessage({
        to: SEARCH_SERVICE,
        from: SERVICE_NAME,
        body: {
            type: 'search',
            query: {
                services: [...q.services]
            },
            options: {
                getServices: false
            },
        }
    }));

    // get the response and filter the first
    const getQuote = function(){
        return new Promise((resolve, reject) => {
            hydra.on('message', message => {
                const {bdy} = message;

                if(bdy.error){
                    reject(bdy.error);
                }

                resolve(bdy.warehouses);
            })
        })
    }

    getQuote()
        .then(warehouses => {
            const topWarehouse = warehouses.length && warehouses[0];

            // get the id and send
            const whId = topWarehouse._id;

            res.sendOk(whId)
        }).catch(err => {
            res.sendError(err);
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
});





module.exports = api;