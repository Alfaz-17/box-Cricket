import mongoose from 'mongoose';

import dotenv from 'dotenv'
dotenv.config();
const connectMongoDB =async()=>{
    try {
        const conn =await mongoose.connect(process.env.MONGO_URI)
        console.log("mongodb connected")
    } catch (error) {
        console.log("mongodb connection error");

        
    }

}

export default connectMongoDB;
