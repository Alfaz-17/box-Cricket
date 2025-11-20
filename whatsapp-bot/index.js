// whatsapp-bot/index.js
import Redis from 'ioredis'
import 'dotenv/config'
import { startBot, sendMessage } from './bot.js'

const redis = new Redis(process.env.REDIS_URI)

// Start WhatsApp bot
await startBot()
console.log('🚀 WhatsApp Bot microservice running...')

// Subscribe to Redis channel // measns listen for message on this channel
redis.subscribe('whatsapp:send')

//handle message when received on the channel
redis.on('message', async (channel, message) => {
  if (channel === 'whatsapp:send') {
    const { number, text } = JSON.parse(message)
    await sendMessage(number, text)
  }
})

//1
// Backend doesn’t directly call sendMessage().
// Instead, it publishes a request:

// redis.publish("whatsapp", JSON.stringify({
//   number: "9199999999",
//   text: "Your OTP is 1234"
// }));

//2 Redis delivers this message to whoever is subscribed (your bot).

//3 WhatsApp bot microservice is subscribed to whatsapp channel:
// redis.on("message", (channel, message) => {
//   sendMessage(JSON.parse(message).number, JSON.parse(message).text);
// });
