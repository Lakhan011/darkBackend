const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Cache with 5 min stdTTL and 6 min checkperiod
const myCache = new NodeCache({ stdTTL: 300, checkperiod: 360 });

const cache = {
  get: (key) => {
    return myCache.get(key);
  },
  
  set: (key, value, ttl) => {
    return myCache.set(key, value, ttl);
  },
  
  del: (keys) => {
    return myCache.del(keys);
  },
  
  flush: () => {
    myCache.flushAll();
    logger.info('Cache flushed');
  }
};

module.exports = cache;
