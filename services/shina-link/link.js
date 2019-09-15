'use strict';

const moment = require("moment");

/**
 * A single link object is a connection between a depositor and a warehouse
 * 
 * It is the single point of communication between the depositor and the warehouse, all communication
 * documents and other information is exchanged through this channel. The depositor ( one who would like 
 * a storage) creates this object with their first request, all subsequent requests will be routed to this 
 * object. 
 * 
 * This channel is a pure object and is meant to be created and destroyed on the fly, that way it should
 * minimise the asynchronous actions it has to do. Caller should cache the requests and use the cached data 
 * to invoke the object.
 * 
 * 
 * Initialization 
 * it is broken down using a builder functions to make it easily composable and modifiable
 * {config}: parameter - object specifying how the link will be initialized. Mostly data to build the link
 * from DB or cache
 * returns - {object} - synchronously returns the created link to that progress specified by the config.
 */

 function Link(config){

 }

 /**
  * Initialization builder class - contains the different builder objects required to build a link
  * 
  * The initialized objects are considered by the precense of keys in the input data.
  * Properties of links
  * - linkId - uniquely and universally identify the link in the database {required}
  * - createdAt - timestamp noting when the link was created 
  * - depositor - depositor object
  * - warehouse - warehouse details
  * - search - search query and results and their timestamps
  * - details - details queries and results and their timestamps
  * - orders - stateful inbound and outbound order manager machines
  * - invoices - stateful quotes records
  * - inventory - inventory on that link
  * - favorites
  * - metadata - information regarding this link
  *     - reference count
  *     - timestamps
  *     - lastUpdatedDate
  *   
  */
 function LinkBuilder(data){
     const {linkId} = data; 
     if(!linkId){
         throw new Error("Cannot initialize the link with an invalid id");
     }

     this.linkId = linkId;
     this.createdAt = data.createdAt || new moment().format();

     return {
        setDepositor: function(depositor){
            this.depositor = depositor;
        },
        setWarehouse: function(warehouse){
            this.warehouse = warehouse;
        },
        
     }
 }