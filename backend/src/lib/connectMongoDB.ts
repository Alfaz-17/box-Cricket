import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectMongoDB = async (): Promise<void> => {
  try {
    // Disable buffering so queries fail fast if connection isn't ready
    mongoose.set('bufferCommands', false);
    
    // TypeScript check for undefined URI
    const uri = process.env.MONGO_URI as string;
    if (!uri) throw new Error("MONGO_URI is not defined");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Wait 5s before failing
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};

export default connectMongoDB;
