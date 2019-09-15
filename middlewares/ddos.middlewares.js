// Attempt to counter DOS attacks since it is exposed as APIS
const Ddos = require('ddos');
const redisClient = require('../utils').redisClient;
const {RateLimiterRedis} = require('rate-limiter-flexible')

// Configure ddos params
const ddos = new Ddos({
    burst: 10,
    limit: 15
  });
  
  const rateLimiter = new RateLimiterRedis({
    redis: redisClient,
    keyPrefix: 'middleware',
    points: 10,
    duration: 1
  });
  
  const rateLimiterMiddleware = (req, res, next) => {
    rateLimiter.consume(req.ip)
      .then(() => {
        next();
      })
      .catch(() => {
        res.status(429).send('Too Many Requests');
      });
  };

module.exports = {
    ddos: ddos.express,
    rateLimiterMiddleware
}