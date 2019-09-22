const redis = require('redis');

const redisClient = redis.createClient({
    host: "172.17.0.2",
    port: 6379,
    enable_offline_queue: false
});

function getRedisClient(){
    return redisClient;
}

module.exports = getRedisClient();