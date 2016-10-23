/**
 * Created by kangtian on 16/10/23.
 */


var Cache = require('node-cache');
var memory_cache = new Cache();


function MemCache() {
    this.is_changed = false;
}
MemCache.prototype.set = function(key, value, ttl, callback) {
    this.is_changed = true;
    return memory_cache.set(key, value, ttl, callback);
};

MemCache.prototype.get = function (key, callback) {
    return memory_cache.get(key, callback);
};

MemCache.prototype.keys = function (callback) {
    return memory_cache.keys(callback);
};

MemCache.prototype.del = function (key, callback) {
    return memory_cache.del(key, callback);
};


module.exports = MemCache;