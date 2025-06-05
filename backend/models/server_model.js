const mongoose=require("mongoose");

const server_schema=mongoose.Schema({
    userID:{
        type:String,
        required:true,
        unique:true,
    },
    server_number:{
        type:Number,
        required:true,
    },
    
},{timestamps:true,versionKey:false})

module.exports=mongoose.model("serverDetail",server_schema);