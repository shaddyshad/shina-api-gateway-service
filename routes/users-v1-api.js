/**
 * Entry point for all user management roles
 */

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

// constants
const THIS_SERVICE_ROUTE = "shina-api-gateway-service:/";
const USERS_SERVICE_ROUTE = "shina-users-service:/";

/**
 * Synchronize user interface signed up user with backend database
 */

api.post('/sync', (req, res) => {
    const {uid} = req.body;


    // use users microservice to synchronize this data
    const msg = hydra.createUMFMessage({
        to: USERS_SERVICE_ROUTE,
        from: THIS_SERVICE_ROUTE,
        body: {
            type: 'sync',
            uid
        }
    });

    hydra.sendMessage(msg);

    res.sendOk({status: 'Success'});
});

/**
 * retrieve use details from the database given a uid
 */
api.get('/:uid', (req, res) => {
  const {uid} = req.params;


  // create a message to users service to retrieve use details
  hydra.sendMessage(hydra.createUMFMessage({
    to: USERS_SERVICE_ROUTE,
    from: THIS_SERVICE_ROUTE,
    body: {
      type: 'details',
      uid
    }
  }));

  // closure to listen for incoming message on this thread - async hack
  const getDetails = function(){
    return new Promise((resolve, reject) => {
      hydra.on('message', message => {
        const {bdy} = message;
        console.log("Message ", bdy);

        // check for errors
        if(bdy.error){
          reject(bdy.error);
        }

        resolve(bdy);
      })
    })
  }

  // wait and send the details back
  getDetails()
    .then(userDetails => {
      res.sendOk(userDetails);
    }).catch(err => {
      res.sendError(err);
    })
})

module.exports = api;