const {ddos} = require('./ddos.middlewares');
const {rateLimiterMiddleware} = require('./ddos.middlewares');
const shinaLinkMiddleware = require('./shina-link.middleware');

module.exports = {
    ddos, 
    rateLimiterMiddleware,
    shinaLinkMiddleware
}