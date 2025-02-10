const user_model= require("../models/user_model");
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const secret=require("../config/auth.config")
const server_model = require("../models/server_model");
const server_config = require("../config/servers.config");
const salt=8;
const signUp=async (req,res)=>{
    // console.log("API called")

    try{
        const req_body=req.body;
        console.log(req_body);
        const user={
            firstName:req_body.firstName,
            lastName:req_body.lastName,
            userID:req_body.userID,
            email:req_body.email,
            password:bcrypt.hashSync(req_body.password,salt),
            userType:req_body.userType
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
        res.status(200).send({
            message:"user successfully created"
        })
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
        // console.log(secret.tokenSecret);
        const token=jwt.sign({userID:user.userID},secret.tokenSecret,{
            expiresIn:secret.tokenDuration
        })
        res.status(200).send({
            token:token,
            message:"Valid user , password matched"
        })
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

module.exports={
    signUp:signUp,
    signIn:signIn,
}

