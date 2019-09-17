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

// routes constants
const THIS_SERVICE_ROUTE = "shina-api-gateway-service:/";
const ORDERS_SERVICE_ROUTE = "shina-orders-service:/";


api.post('/new/inbound', (req, res) => {
  
  const {quoteId} = req.body;

  if(!quoteId){
    console.log("Error missing quoteId");
    res.sendError({
      error: {
        code: 'invalid-argument',
        message: 'Missing or invalid quoteId'
      }
    })
  }


  const inboundMessage = hydra.createUMFMessage({
    to: ORDERS_SERVICE_ROUTE,
    from: THIS_SERVICE_ROUTE,
    body: {
      type: 'new_inbound',
      quoteId
    }
  });

  console.log("Message ", inboundMessage);

  hydra.sendMessage(inboundMessage);

  // quote getter closure
  const getOrder = function(){
    return new Promise((resolve, reject) => {
      hydra.on('message', message => {
        const {bdy} = message;

        console.log("New incoming ", message);

        if(bdy.error){
          reject(new Error(bdy.error));
        }

        // resolve with the order details
        resolve(bdy);
      })
    })
  }

  // retrieve
  getOrder().then(order => {
    res.sendOk(order)
  }).catch(err => {
    res.sendError({
      error: {
        code: 'error',
        message: 'an error occured'
      }
    })
  })
})

/**
 * Retrieve all orders that belong to a users
 */
api.get('/get/:uid', (req, res) => {
  const {uid} = req.params;

  if(!uid){
    res.sendError({
      error: {
        code: 'invalid-argument',
        message: 'given uid is invalid or missing'
      }
    })
  }

  // create a message to get orders 
  const msg = hydra.createUMFMessage({
    to: ORDERS_SERVICE_ROUTE,
    from: THIS_SERVICE_ROUTE,
    body: {
      type: 'get_orders',
      uid
    }
  });

  hydra.sendMessage(msg);

  // closure to listen for response
  const getOrders = function(){
    return new Promise((resolve, reject) => {
      hydra.on('message', message => {
        const {bdy} = message;

        if(bdy.error){
          reject(new Error(err));
        }

        // 
        resolve(bdy);
      })
    })
  }

  // handle
  getOrders()
    .then(orders => {
      res.sendOk(orders);
    }).catch(err => {
      res.sendError(err);
    })
})

module.exports = api;