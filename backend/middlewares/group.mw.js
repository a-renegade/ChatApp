const group_model=require("../models/group.model");
const userModel = require("../models/user_model");
const jwt=require("jsonwebtoken")
require('dotenv/config') 
const verifyCreateGroupBody=async(req,res,next)=>{
    try{
        const reqBody=req.body;
        if(!reqBody.userID){
            console.log("userID not provided for createGroup request")
            return res.status(400).send({
                message:"userID not provided for for createGroup request"
            })
        }
        if(!reqBody.name){
            console.log("name not provided for createGroup request")
            return res.status(400).send({
                message:"name not provided for for createGroup request"
            })
        }
        if(!reqBody.groupID){
            console.log("groupID not provided for createGroup request")
            return res.status(400).send({
                message:"groupID not provided for for createGroup request"
            })
        }
        if(!reqBody.members){
            console.log("members not provided for createGroup request")
            return res.status(400).send({
                message:"members not provided for createGroup request"
            })
        }
        if(!reqBody.members.includes(reqBody.userID)){
            req.body.members.push(reqBody.userID);
        }
        
    }catch(err){
        console.log("Error occured while checking createGroup body",err);
        return res.status(500).send({
            message:"Error occured while checking createGroup body"
        })
    }
    try{
        
        const token=req.cookies.jwt;
        const tokenDetails=jwt.verify(token,process.env.JWT_SECRET);
        if(tokenDetails.userID!==req.body.userID){
            console.log("User is using someone else's token")
            return res.status(400).send({
                message:"User is using someone else's token"
            })
        }
        req.user=tokenDetails;
    }catch(err){
        console.log("Not a Valid token for createGroup request",err);
        return res.status(401).send({
            message:"Not a Valid token for createGroup request"
        })
    }
    try{
        const reqBody=req.body;
        const groupExist=await group_model.findOne({groupID:reqBody.groupID});
        if(groupExist){
            console.log("group with provided groupID already exists")
            return res.status(400).send({
                message:"group with provided groupID already exists"
            })
        }
        reqBody.members.forEach(async member => {
            const user=await userModel.findOne({userID:member});
            if(!user){
                console.log("group member does not exists:",member)
                return res.status(400).send({
                    message:"group member does not exists:"
                })
            }
        });

        
        next();
    }catch(err){
        console.log("Error occured while verifying createGroup body",err);
        return res.status(500).send({
            message:"Error occured while verifying createGroup body"
        })
    }

}

module.exports={
    verifyCreateGroupBody:verifyCreateGroupBody,
}