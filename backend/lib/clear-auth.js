import fs from 'fs';
import path from 'path';

const authPath = '.auth';

if (fs.existsSync(authPath)) {
  fs.rmSync(authPath, { recursive: true, force: true });
  console.log('✅ Auth folder cleared.');
} else {
  console.log('⚠️ Auth folder does not exist.');
}
