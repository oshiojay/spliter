const Redis = require('ioredis')
const client = new Redis("redis://default:59Fl8PFihw4XHqBrR5QZ3zzSwPQ3hDw3@jeans-maroonish-fair-95638.db.redis.io:16578")

client.on('error', (err) => {
    console.log('Redis error:', err)
})

client.on('connect', (err) => {
    console.log('Redis successfully connected')
})

module.exports = client