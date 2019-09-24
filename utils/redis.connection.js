const redis = require('redis');
const config = require('../config/config.json')

const redisClient = redis.createClient({
    host: config.hydra.redis.url || "172.17.0.3",
    port: 6379,
    enable_offline_queue: false
});

function getRedisClient(){
    return redisClient;
}

module.exports = getRedisClient();