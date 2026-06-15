import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function fix() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');
    const db = mongoose.connection.db;
    
    console.log('Dropping all indexes on users collection...');
    await db.collection('users').dropIndexes();
    
    // Re-create the User model exactly like the app
    const userSchema = new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        contactNumber: { type: String, unique: true, sparse: true },
        googleId: { type: String, unique: true, sparse: true },
    });
    const User = mongoose.model('User', userSchema);
    
    console.log('Syncing correct sparse indexes...');
    await User.syncIndexes();
    
    console.log('Done! Indexes are fixed.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fix();
