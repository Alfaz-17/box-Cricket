import { MongoClient } from 'mongodb'
import makeWASocket, {
  fetchLatestBaileysVersion,
  DisconnectReason,
  initAuthCreds,
  BufferJSON,
} from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import P from 'pino'
import { Boom } from '@hapi/boom'
import dotenv from 'dotenv'

dotenv.config()

let sock = null
let isConnected = false

async function startBot() {
  try {
    const { version } = await fetchLatestBaileysVersion()
    console.log(`✅ Using Baileys version: ${version.join('.')}`)

    // --- MongoDB connection ---
    const client = new MongoClient(process.env.MONGO_URI)
    await client.connect()
    console.log('✅ Connected to MongoDB')
    const db = client.db('test')
    const collection = db.collection('whatsappAuth')

    // --- Load creds from DB or start fresh ---
    let creds,
      keys = {}
    const authDoc = await collection.findOne({ _id: 'auth' })

    if (!authDoc) {
      console.log('⚠️ No creds found → starting fresh')
      creds = initAuthCreds()
    } else {
      try {
        const parsed = JSON.parse(authDoc.data, BufferJSON.reviver)
        creds = parsed.creds || initAuthCreds()
        keys = parsed.keys || {}
      } catch (err) {
        console.log('⚠️ Corrupted creds → resetting')
        creds = initAuthCreds()
        keys = {}
      }
    }

    // --- Proper auth state wrapper ---
    const authState = {
      creds,
      keys: {
        get: (type, ids) => {
          return ids.map(id => keys[`${type}:${id}`]).filter(Boolean)
        },
        set: data => {
          for (const category in data) {
            for (const id in data[category]) {
              keys[`${category}:${id}`] = data[category][id]
            }
          }
        },
      },
    }

    // --- Create socket ---
    sock = makeWASocket({
      version,
      auth: authState,
      logger: P({ level: 'error' }),
      printQRInTerminal: true, // QR will auto print in terminal
    })

    // --- Connection updates ---
    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr) qrcode.generate(qr, { small: true })

      if (connection === 'close') {
        isConnected = false
        const code = lastDisconnect?.error ? new Boom(lastDisconnect.error).output.statusCode : 0
        console.log(`❌ Connection closed with code ${code}`)
        if (code !== DisconnectReason.loggedOut) setTimeout(startBot, 5000)
      } else if (connection === 'open') {
        console.log('✅ WhatsApp bot connected')
        isConnected = true
      }
    })

    // --- Save creds to DB whenever updated ---
    sock.ev.on('creds.update', async () => {
      try {
        const serialized = JSON.stringify({ creds, keys }, BufferJSON.replacer)
        await collection.updateOne(
          { _id: 'auth' },
          { $set: { data: serialized } },
          { upsert: true }
        )
        console.log('💾 Creds updated in MongoDB')
      } catch (err) {
        console.error('❌ Failed to save creds:', err)
      }
    })
  } catch (err) {
    console.error('❌ Failed to start WhatsApp bot:', err)
  }
}

// --- Send Message ---
async function sendMessage(number, text) {
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

export { startBot, sendMessage }
