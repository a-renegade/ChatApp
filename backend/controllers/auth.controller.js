const user_model= require("../models/user_model");
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const server_model = require("../models/server_model");
const server_config = require("../config/servers.config");
const generateToken = require("../lib/jwt.js");

require('dotenv/config') 
const salt=8;
const signUp=async (req,res)=>{
    

    try{
        const req_body=req.body;
        console.log(req_body);
        const user={
            fullName:req_body.fullName,
            userID:req_body.userID,
            email:req_body.email,
            password:bcrypt.hashSync(req_body.password,salt),
            userType:"USER"
        }
        let ret=await user_model.create(user);
        console.log("user successfully created",ret);
        let Server_number=50000+Math.floor(Math.random()*server_config.total_number); 
        
        const server_details={
            userID:req_body.userID,
            server_number:Server_number
        }
        
        let ret2=await server_model.create(server_details);
        console.log("server successfully alloted",ret2);
        const token=generateToken(req_body.userID,res);
        
        res.status(200).send(req_body.userID)
    }catch(err){   
        console.log("error while creating user",err);
        res.status(500).send({
            message:"error while creating user"
        })
    }
} 
const signInHelper=async (req,res,user)=>{
    const req_body=req.body;
    try{
        const isPassValid=bcrypt.compareSync(req_body.password,user.password);
        if(!isPassValid){
            console.log("wrong password");
            return res.status(401).send({
                message:"wrong password"
            })
        }
        console.log("Valid user , password matched");
        // console.log(process.env.JWT_SECRET);
        const token=generateToken(req_body.userID,res);
        // console.log(token)
        res.status(200).send(req_body.userID)
    }catch(err){
        console.log("error occured while signing in",err);
        res.status(500).send({
            message:"error occured while signing in"
        })
    }
}
const signIn=async (req,res)=>{
    try{
        
        const req_body=req.body;
        if(req_body.email){
            const user=await user_model.findOne({email:req_body.email});
            signInHelper(req,res,user);
            
        }else{
            const user=await user_model.findOne({userID:req_body.userID});
            signInHelper(req,res,user);
        }
    }catch(err){
        console.log("error occured while signing in",err);
        res.status(500).send({
            message:"error occured while signing in"
        })
    }
}

const authCheck =async (req,res)=>{
    try{
        // if(!req.headers["token"]){
        //     console.log("token not provided for authCheck request")
        //     return res.status(400).send({
        //         message:"token not provided for authCheck request"
        //     })
        // }
        const token=req.cookies.jwt;
        
        console.log();
        const tokenDetails=jwt.verify(token,process.env.JWT_SECRET);
        console.log("Valid Token for authCheck",tokenDetails.userID)
        res.status(200).send({userID:tokenDetails.userID});
    }catch(err){
        console.log("Not a Valid token for authCheck request",err.message);
        return res.status(401).send({
            message:"Not a Valid token for authCheck request"
        })
    }
}
const logout=async (req,res)=>{
    console.log("Logout requested")
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
      } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
      }
}
module.exports={
    signUp:signUp,
    signIn:signIn,
    authCheck:authCheck,
    logout:logout,
}

