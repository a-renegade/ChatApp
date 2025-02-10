const mongoose=require("mongoose");
const db=mongoose.connection;

const userSchema=new mongoose.Schema(
    {
        firstName:{
            type:String,
            required:true,
        },
        lastName:{
            type:String,
        },
        friends:[], 
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true
        },
        password:{
            type:String,
            required:true,
            minLength:3,
        },
        userID:{
            type:String,
            unique:true,
            required:true,

        },
        userType:{
            type:String,
            default:"USER",
            enum:["ADMIN","USER"]
        }
        

    },{timestamps:true,versionKey:false})

    module.exports=mongoose.model("User",userSchema);