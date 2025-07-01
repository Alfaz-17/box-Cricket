import mongoose  from "mongoose";




const messageSchema = await mongoose.Schema({
    group:{type:mongoose.Schema.Types.ObjectId,ref:"Group"},
    sender:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    content:String,
    

},
{timestamps:true}
);


export default mongoose.model("Message",messageSchema);