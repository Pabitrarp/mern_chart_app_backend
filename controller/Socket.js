const { default: mongoose } = require("mongoose");
const useremodel= require("../models/User")
const chartmodel=require("../models/chartmodel");
module.exports=(io)=>{
    io.on("connection",(socket)=>{
       
        socket.on("savemessage",async(data)=>{
            const {sender,receiver,message}=data;
            try {
                const savemessage= await chartmodel.create({sender,receiver,message});
                if (savemessage){
                    io.to(receiver).emit("recive_message",savemessage);
                    io.to(sender).emit("recive_message",savemessage);
                }
            } catch (error) {
                console.log(error);
                socket.emit("error",{message:"faild to send message"})
            }
        })
      
        ////fetch data //

      
        socket.on("getmessage",async(data)=>{
            const {sender,receiver}=data;
            try {
                const meaasges=await chartmodel.find({
                    $or:[{sender:sender,receiver:receiver},
                        {sender:receiver,receiver:sender}
                    ]
                }).sort({createdAt:1});

                socket.emit("receivedmessage",meaasges);
            } catch (error) {
                console.log(error);
                socket.emit("error",{message:"errori featching data"})
            }
        })
 ///////////// get all user and last message ///
 socket.on("getallusermessage",async(data)=>{
    
    const {userid}=data
    
   try {
    
    const data=await chartmodel.aggregate([
        {
            $match:{$or:[{sender_id:userid},{receiver_id:userid}]}
        },
        {
           $group:{
            _id:{
                $cond:{
                    if:{$eq:["$sender_id",userid]},
                    then:"$receiver_id",
                    else:"$sender_id",
                }
            },
            latestmessage:{$last:"$message"},
            time:{$last:"$createdAt"},
                unreadmessage: {
                    $sum:
                    {
                        $cond:
                            [{
                                $and:
                                    [{ $eq: ["$receiver_id", userid] }, { $eq: ["$isread", false] }]
                            }, 1, 0,]
                    }
                }
            },
        },
        {
            $lookup:{
                from:"Users",
                localField:"_id",
                foreignField:"_id",
                as:"data"
            }
        },
        // {
        //     $unwind:"$data"
        // },
        // {
        //    $project:{
        //     receiverid:"$_id",
        //     name:"$data",
        //     latestmessage:1,
        //     time:1,
        //     unreadmessage:1
        //    }
        // }
    ]);
    // console.log(data);
    socket.emit("charts",data);
   } catch (error) {
    console.log(error);
   }
 })
   
/// find user//
socket.on("finduser",async(data)=>{
    const {searchvalue}=data;
    try {
         const user= await useremodel.find({mobile:searchvalue})
         if (user) socket.emit("user",user);
         
    } catch (error) {
        console.log(error);
    }
}) 
socket.on("disconnect",()=>{
    console.log("disconnecct",socket.id)
})
  })
  
}