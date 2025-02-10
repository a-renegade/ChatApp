const mongoose=require("mongoose");

const groupSchema=mongoose.Schema({
    groupID:{
        type:String,
        required:true,
        unique:true,
    },
    admin:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    bio:{
        type:String,
    },
    
    members:[],

},{timestamps:true,versionkey:false})

module.exports=mongoose.model("Group",groupSchema);