const Redis = require('ioredis');
const JSONCache = require('redis-json');

const redisConfig = {
    host:'172.17.0.3',
    port: 6379,
    db: 4
};

function ShinaCache(){
    this.redis = new Redis(redisConfig);
    this._cache = new JSONCache(this.redis, {prefix: 'cache'});
}

/**
 * Set the value at key
 */
ShinaCache.prototype.setData = function(key, value){
    return this._cache.set(key, value);
}

ShinaCache.prototype.getData = function(key){
    return this._cache.get(key);
}


const shinaCache = new ShinaCache();

module.exports = shinaCache;