import { MongoClient } from 'mongodb'
import baileys from '@whiskeysockets/baileys'
import { useMongoDBAuthState } from 'mongo-baileys'
import qrcode from 'qrcode-terminal'
import P from 'pino'
import { Boom } from '@hapi/boom'
import dotenv from 'dotenv'

dotenv.config()

let sock = null
let isConnected = false

export async function startBot() {
  try {
    const { version } = await baileys.fetchLatestBaileysVersion()

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGO_URI)
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db('test')
    const collection = db.collection('whatsappAuth')

    // Auth state using mongo-baileys
    const { state, saveCreds } = await useMongoDBAuthState(collection)

    // Create WhatsApp socket
    sock = baileys.makeWASocket({
      version,
      auth: state,
      logger: P({ level: 'silent' }),
    })

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        console.log('📲 Scan the QR code with WhatsApp:')
        qrcode.generate(qr, { small: true })
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error
          ? new Boom(lastDisconnect.error).output.statusCode
          : 0

        isConnected = false
        console.log(`❌ Connection closed with code: ${statusCode}`)

        if (statusCode === baileys.DisconnectReason.loggedOut) {
          console.log('⚠️ Logged out. Delete MongoDB credentials to restart login.')
        } else {
          console.log('🔁 Reconnecting...')
          setTimeout(startBot, 5000)
        }
      } else if (connection === 'open') {
        console.log('✅ WhatsApp bot connected')
        isConnected = true
      }
    })

    sock.ev.on('creds.update', async () => {
      await saveCreds() // save to MongoDB silently
    })

    // 🤖 LISTEN FOR MESSAGES
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return
      const msg = messages[0]
      if (!msg.message || msg.key.fromMe) return

      const jid = msg.key.remoteJid
      const number = jid.split('@')[0]
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text
      
      if (!text) return
      console.log(`📩 New message from ${number}: ${text}`)

      // Handle common greetings or "Mota Bhai" specific calls
      const lowerText = text.toLowerCase()
      if (lowerText === 'hi' || lowerText === 'hello' || lowerText.includes('mota bhai')) {
        const welcome = "नमस्ते मोटा भाई! मैं आपकी स्लॉट चेक करने में मदद कर सकता हूँ। बस आप तारीख और समय बता दीजिए।"
        await sendMessage(number, welcome)
        return
      }

      try {
        // 🆔 Use phone number as Session ID
        const { getSession, updateSession } = await import('./conversationSession.js')
        const { parseVoiceQuery } = await import('./parseVoiceQuery.js')
        const { findAvailableSlots } = await import('./findAvailableSlots.js')
        const { buildVoiceResponse } = await import('./buildVoiceResponse.js')

        const conversationContext = getSession(number)
        
        // 1️⃣ Parse Intent (Reusable logic)
        const parsed = await parseVoiceQuery(text, conversationContext)
        console.log(`🤖 Parsed for WhatsApp (${number}):`, parsed)

        // 💾 Update session
        updateSession(number, {
          date: parsed.date,
          startTime: parsed.startTime,
          duration: parsed.duration,
          language: parsed.language
        })

        if (parsed.intent === 'check_slot' || parsed.intent === 'book_slot') {
          let replyText = ""
          
          if (parsed.needsMoreInfo) {
             // 2a Ask follow up
             replyText = await buildVoiceResponse({ parsed, result: null })
          } else {
             // 2b Check Slots
             const result = await findAvailableSlots({
                date: parsed.date,
                startTime: parsed.startTime,
                duration: parsed.duration
             })
             // 3 Build Response
             replyText = await buildVoiceResponse({ parsed, result })
          }

          // 4 Send back to user
          await sendMessage(number, replyText)
        }

      } catch (error) {
        console.error('❌ WhatsApp AI Error:', error)
      }
    })

  } catch (err) {
    console.error('❌ Failed to start WhatsApp bot:', err)
  }
}

// Send a message
export async function sendMessage(number, text) {
  if (!isConnected || !sock) {
    console.log('⚠️ WhatsApp bot not connected yet')
    return
  }

  const jid = `${number}@s.whatsapp.net`
  try {
    await sock.sendMessage(jid, { text })
    console.log(`✅ Message sent to ${number}`)
  } catch (err) {
    console.error('❌ Failed to send message:', err)
  }
}
