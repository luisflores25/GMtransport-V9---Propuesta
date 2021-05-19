const redis = require('redis');
const config= require('../config.json');



//Configure redis client
const redisClient = redis.createClient({
    host: config.RedisServer,
    port: config.RedisPort
})
module.exports = redisClient;