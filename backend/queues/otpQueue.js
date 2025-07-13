import { Queue } from 'bullmq';
import { connection } from '../lib/redisClient.js';

export const otpQueue = new Queue('otpQueue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});
