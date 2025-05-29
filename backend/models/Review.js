import mongoose from 'mongoose'


const ReviewsSchema = new mongoose.Schema({

  boxId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box',
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
  type:String,
  required: true
  },
  name: String,
  rating:Number ,
    averageRating:Number,
    reviewCount:Number
  
 
},{timestamps:true});

export default mongoose.model("reviews", ReviewsSchema);
