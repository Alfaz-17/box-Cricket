import { Worker } from 'bullmq';
import { connection } from '../lib/redisClient.js';
import { sendMessage } from '../lib/whatsappBot.js';

export const otpWorker = new Worker(
  'otpQueue',
  async (job) => {
    const { contactNumber, otp, ttl } = job.data;

    const rateLimitKey = `otp-sent:${contactNumber}`;
    const alreadySent = await connection.get(rateLimitKey);
    if (alreadySent) {
      throw new Error("OTP recently sent, please try again later");
    }

    // Set OTP and rate limiter
    await connection.set(`otp:${contactNumber}`, otp, 'EX', ttl);
    await connection.set(rateLimitKey, 'true', 'EX', 60);

    // Send WhatsApp Message
 await sendMessage(
      `91${contactNumber}`,
      `Your SignUp Otp is: ${otp}. It is valid for 5 minutes.`
    );
    },
  { connection }
);

// Job status logs
otpWorker.on('completed', job => {
  console.log("✅ Job completed:", job.id);
});

otpWorker.on('failed', (job, err) => {
  console.error("❌ Job failed:", job.id, err.message);
});
