const mongoose=require("mongoose");

const msgSchema=mongoose.Schema({
    fromGroup:{
        type:String,
    },
    from:{
        type:String,
        required:true,
    },
    userID:{
        type:String,
        required:true,
    },
    message:{
        type:String,
        required:true,
    }
},{timestamps:true,versionKey:false});

module.exports=mongoose.model("unstMessage",msgSchema)