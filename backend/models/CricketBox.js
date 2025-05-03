import mongoose from "mongoose";



const cricketBoxSchema = new mongoose.Schema({

    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    name:{type:String,required:true},
    location:{type:String,required:true},
    hourlyRate:{type:Number,required:true},
    mobileNumber: {
        type: String,
        required: true,
        match: /^[6-9]\d{9}$/, // Validates Indian-style 10-digit mobile number
      },
    description:{type:String},
    blockedSlots:[{
        date:{type:String},
        startTime:{type:String},
        endTime: { type: String },
    }]



});


export default mongoose.model("CricketBox", cricketBoxSchema);
