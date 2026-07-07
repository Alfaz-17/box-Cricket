import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to this file to support running from workspace root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z.string().optional().default('5001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1, "MongoDB URI is required for the database to connect."),
  JWT_SECRET: z.string().min(10, "JWT Secret must be at least 10 characters long for security."),
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),
  CASHFREE_CLIENT_ID: z.string().optional(),
  CASHFREE_CLIENT_SECRET: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  // Include other vital keys here...
});

// We infer the types so we can use envVars throughout the app securely
export type EnvVars = z.infer<typeof envSchema>;

let envVars: EnvVars;

try {
  envVars = envSchema.parse(process.env);
} catch (error: any) {
  if (error instanceof z.ZodError || (error && (error.issues || error.errors))) {
    console.error('❌ CRITICAL ERROR: Invalid Environment Variables ❌');
    console.error('The server refuses to start because the following .env variables are missing or invalid:');
    const issues = error.issues || error.errors || [];
    issues.forEach((err: any) => {
      console.error(`👉 ${err.path ? err.path.join('.') : 'variable'}: ${err.message}`);
    });
    // Crash the server immediately! It is unsafe to run without these.
    process.exit(1); 
  }
  throw error;
}

export { envVars };
