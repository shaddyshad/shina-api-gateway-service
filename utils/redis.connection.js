const redis = require('redis');

const redisClient = redis.createClient({
    host: "104.248.165.225",
    port: 6379,
    enable_offline_queue: false
});

function getRedisClient(){
    return redisClient;
}

module.exports = getRedisClient();