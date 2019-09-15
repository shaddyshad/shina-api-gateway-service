/**
 * Inter process message proxy
 * 
 * Modifies and sends the request in microservices
 */
const logger = require('./logger');
const hydraExpress = require('hydra-express');
const hydra = hydraExpress.getHydra();

function MessageProxy(){
    this.createMessage = function(from, to, message){
        // Ensure that the parameters are filled 
        return new Promise((resolve, reject) => {
            if( !from ){
                const logEntry = `${Date.now()} - Source address not specified`;
                logger.logInfo(logEntry);
                reject(logEntry);
            }
            if( !to ){
                const logEntry = `${Date.now()} - Destination address not specified`;
                logger.logInfo(logEntry);
                reject(logEntry);
            } 
            
            // Process the message and send 
            const message = hydra.createUMFMessage({
                to,
                from,
                body
            });

            return message;

        })
        
    }
}

const messageProxy = new MessageProxy();
module.exports = messageProxy;