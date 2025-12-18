import mongoose from 'mongoose'

import dotenv from 'dotenv'
dotenv.config()
const connectMongoDB = async () => {
  try {
    // Disable buffering so queries fail fast if connection isn't ready
    mongoose.set('bufferCommands', false);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Wait 5s before failing
    })
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
  }
}

export default connectMongoDB
