import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const IV_SIZE = 12;
const TAG_SIZE = 16;
const HMAC_SIZE = 48;

// Convert hex string to Buffer
function hexToBuffer(hex) {
  return Buffer.from(hex, 'hex');
}

// Convert Buffer to uppercase hex string
function bufferToHex(buffer) {
  return buffer.toString('hex').toUpperCase();
}

/**
 * Encrypt plaintext string -> HEX string (HMAC || IV || ciphertext || tag)
 * Uses AES-256-GCM with HMAC-SHA384 authentication
 * @param {string} plaintext - The plaintext string to encrypt
 * @returns {string} - Hex-encoded encrypted message
 */
export function encrypt(plaintext) {
  const aesKey = Buffer.from(process.env.SABPAISA_AES_KEY, 'base64');
  const hmacKey = Buffer.from(process.env.SABPAISA_HMAC_KEY, 'base64');

  // Generate random IV
  const iv = crypto.randomBytes(IV_SIZE);

  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv, { 
    authTagLength: TAG_SIZE 
  });

  // Encrypt the plaintext
  let encrypted = cipher.update(Buffer.from(plaintext, 'utf8'));
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Get authentication tag
  const tag = cipher.getAuthTag();

  // Combine IV + encrypted + tag
  const encryptedMessage = Buffer.concat([iv, encrypted, tag]);

  // Generate HMAC for integrity
  const hmac = crypto.createHmac('sha384', hmacKey)
    .update(encryptedMessage)
    .digest();

  // Final message: HMAC || IV || ciphertext || tag
  const finalMessage = Buffer.concat([hmac, encryptedMessage]);

  return bufferToHex(finalMessage);
}

/**
 * Decrypt HEX string -> plaintext string
 * Validates HMAC and decrypts using AES-256-GCM
 * @param {string} hexCiphertext - Hex-encoded encrypted message
 * @returns {string} - Decrypted plaintext
 */
export function decrypt(hexCiphertext) {
  const aesKey = Buffer.from(process.env.SABPAISA_AES_KEY, 'base64');
  const hmacKey = Buffer.from(process.env.SABPAISA_HMAC_KEY, 'base64');

  const fullMessage = hexToBuffer(hexCiphertext);

  // Validate message length
  if (fullMessage.length < HMAC_SIZE + IV_SIZE + TAG_SIZE) {
    throw new Error('Invalid ciphertext length');
  }

  // Extract HMAC and encrypted data
  const hmacReceived = fullMessage.slice(0, HMAC_SIZE);
  const encryptedData = fullMessage.slice(HMAC_SIZE);

  // Compute HMAC for validation
  const hmacComputed = crypto.createHmac('sha384', hmacKey)
    .update(encryptedData)
    .digest();

  // Validate HMAC (timing-safe comparison)
  if (!crypto.timingSafeEqual(hmacReceived, hmacComputed)) {
    throw new Error('HMAC validation failed - data may be tampered');
  }

  // Extract IV, tag, and ciphertext
  const iv = encryptedData.slice(0, IV_SIZE);
  const tag = encryptedData.slice(encryptedData.length - TAG_SIZE);
  const ciphertext = encryptedData.slice(IV_SIZE, encryptedData.length - TAG_SIZE);

  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv, { 
    authTagLength: TAG_SIZE 
  });
  decipher.setAuthTag(tag);

  // Decrypt
  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Generate random string helper function
 * @param {number} len - Length of random string
 * @param {string} arr - Characters to use
 * @returns {string} - Random string
 */
export function randomStr(len, arr) {
  let ans = '';
  for (let i = 0; i < len; i++) {
    ans += arr[Math.floor(Math.random() * arr.length)];
  }
  return ans;
}
