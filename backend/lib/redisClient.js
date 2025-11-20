// redisClient.js

import dotenv from 'dotenv'
dotenv.config()
import Redis from 'ioredis'

export const connection = new Redis(process.env.REDIS_URI, {
  maxRetriesPerRequest: null,
})

connection.on('connect', () => {
  console.log('✅ Connected to Redis')
})

connection.on('error', err => {
  console.error('❌ Redis error:', err)
})
