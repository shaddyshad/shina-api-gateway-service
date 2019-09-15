const shinaCache = require('../cache');
const uuidv4 = require('uuid/v4');
const moment = require('moment');
const EventEmitter = require('events').EventEmitter;

class ShinaLinkEmitter extends EventEmitter{
    registerHandler(event, cb) {
        this.addListener(event, cb);
    }
}

const shinaLinkEmitter = new ShinaLinkEmitter();

function ShinaLink(){
    this.version = "0.0.1";
    
    return this;
}

/**
 * Get the shinaLink object associated with the specified
 * 
 */
ShinaLink.prototype.getLinkById = function(linkId){
    return new Promise((resolve, reject) => {
        // Hit cache to retrieve the data, or the DB, or create a new one
    })

}

/**
 * Create a new link object and return the initialized ID, save the link data 
 * 
 * Generate a link and initialization data and save it to the DB
 */

 ShinaLink.prototype.createNewLink = function(){
     const linkId = this.newLinkId();

     const data = {
        createdAt: moment().format()
     }
    //  Save data to cache and resolve with ID
     return new Promise((resolve, reject) => {
         shinaCache.setData(linkId, data).then(() => {
            //  Emit an cacheWrite event 
            shinaLinkEmitter.emit('cacheWrite', {...data, linkId});
            resolve(linkId);
         });
     })
 }

/**
 * Create a new link id 
 */

 
 
 
 
 ShinaLink.prototype.newLinkId = function(){
    //  Compute a UUID and resolve 
    return uuidv4();
 }

const shinaLink = new ShinaLink();

function getShinaLink(linkId){
    return new Promise((resolve, reject) => {
        resolve(shinaLink);
    })
}

module.exports = getShinaLink;