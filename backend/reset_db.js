import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function resetDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');
    
    const db = mongoose.connection.db;
    
    console.log('Clearing users collection...');
    await db.collection('users').deleteMany({});
    
    console.log('Clearing otps collection...');
    await db.collection('otps').deleteMany({});
    
    console.log('Database wiped successfully! Fresh start ready.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetDB();
