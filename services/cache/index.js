const JSONCache = require('redis-json');
const redisClient = require('../../utils').redisClient;

function ShinaCache(){
    this._cache = new JSONCache(redisClient, {prefix: 'cache'});
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