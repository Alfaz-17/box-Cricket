import Redis from 'ioredis'
import dotenv from 'dotenv'

dotenv.config()
const redis = new Redis(process.env.REDIS_URI, {
  maxRetriesPerRequest: null, // Critical for BullMQ
  enableReadyCheck: false,
  connectTimeout: 5000, // 5 seconds timeout
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
})

redis.on('connect', () => {
  console.log('✅ Redis connected successfully')
})

redis.on('error', err => {
  console.error('❌ Redis connection error:', err.message)
})

export default redis
