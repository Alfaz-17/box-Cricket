import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // root env

async function fixMongo() {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('test');
    console.log('Dropping whatsappAuth collection due to corruption...');
    await db.collection('whatsappAuth').drop().catch(() => console.log('Collection might not exist, skipping drop.'));
    
    console.log('Successfully cleared WhatsApp Auth state! The error should be gone.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixMongo();
