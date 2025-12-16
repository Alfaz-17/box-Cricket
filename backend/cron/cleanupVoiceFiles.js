import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function startCleanupJob() {
  console.log('🧹 Voice Cleanup Job Started (Interval: 5 mins)');
  
  // Run every 5 minutes (300,000 ms)
  setInterval(async () => {
    try {
      const uploadsDir = path.join(__dirname, '../uploads');
      
      if (!fs.existsSync(uploadsDir)) return;

      const files = await fs.promises.readdir(uploadsDir);
      const now = Date.now();
      const MAX_AGE = 5 * 60 * 1000; // 5 minutes

      for (const file of files) {
        // Only target voice files or temp uploads
        if (!file.startsWith('voice_') && !file.startsWith('upload_')) continue;

        // 🛡️ Skip the static rate limit audio file (Optimization)
        if (file === 'voice_limit_hindi.mp3') continue;

        const filePath = path.join(uploadsDir, file);
        const stats = await fs.promises.stat(filePath);

        if (now - stats.mtimeMs > MAX_AGE) {
          await fs.promises.unlink(filePath);
          console.log(`🗑️ Deleted old voice file: ${file}`);
        }
      }
    } catch (err) {
      console.error('Cleanup Job Error:', err);
    }
  }, 5 * 60 * 1000); 
}
