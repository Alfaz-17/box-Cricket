// whatsappBot.js
import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import P from 'pino';
let sock = null;
let isConnected = false;

// Initialize the bot
export async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  console.log(`Using Baileys version: ${version.join('.')}`);

  const { state, saveCreds } = await useMultiFileAuthState('./auth');

  sock = makeWASocket({ version, auth: state,logger: P({ level: 'error' }) });

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('Scan this QR code with your WhatsApp:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error ? new Boom(lastDisconnect.error).output.statusCode : 0;
      console.log(`Connection closed with status: ${statusCode}`);
      isConnected = false;

      if (statusCode === DisconnectReason.loggedOut) {
        console.log('Logged out. Delete auth folder to restart login.');
      } else {
        console.log('Reconnecting...');
        setTimeout(startBot, 5000);
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp bot connected');
      isConnected = true;
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

// Export sendMessage for use in routes/controllers
export async function sendMessage(number, text) {
  if (!isConnected || !sock) {
    console.log('⚠️ WhatsApp bot not connected yet');
    return;
  }

  const jid = `${number}@s.whatsapp.net`;
  try {
    await sock.sendMessage(jid, { text });
    console.log(`✅ Message sent to ${number}`);
  } catch (err) {
    console.error('❌ Failed to send message:', err);
  }
}
