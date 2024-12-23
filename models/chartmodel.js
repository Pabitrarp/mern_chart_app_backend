const mongose=require("mongoose")

const chartschema=new mongose.Schema({
  sender_id:{
    type:mongose.Types.ObjectId,
    ref:'Users'
  },
  receiver_id:{
    type:mongose.Types.ObjectId,
    ref:'Users'
  },
  message:{
    type:String,
    
  },
  isread:{type:Boolean,
    default:false
  },
},{timestamps:true});
module.exports = mongose.model("chart",chartschema);