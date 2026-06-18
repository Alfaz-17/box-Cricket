import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  PORT: z.string().optional().default('5001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1, "MongoDB URI is required for the database to connect."),
  JWT_SECRET: z.string().min(10, "JWT Secret must be at least 10 characters long for security."),
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),
  CASHFREE_CLIENT_ID: z.string().optional(),
  CASHFREE_CLIENT_SECRET: z.string().optional(),
  // Include other vital keys here...
});

// We infer the types so we can use envVars throughout the app securely
export type EnvVars = z.infer<typeof envSchema>;

let envVars: EnvVars;

try {
  envVars = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ CRITICAL ERROR: Invalid Environment Variables ❌');
    console.error('The server refuses to start because the following .env variables are missing or invalid:');
    error.errors.forEach((err) => {
      console.error(`👉 ${err.path.join('.')}: ${err.message}`);
    });
    // Crash the server immediately! It is unsafe to run without these.
    process.exit(1); 
  }
  throw error;
}

export { envVars };
