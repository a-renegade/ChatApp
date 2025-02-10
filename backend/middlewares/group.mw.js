const group_model=require("../models/group.model");
const secret=require("../config/auth.config");
const user_model = require("../models/user_model");
const jwt=require("jsonwebtoken")
const verifyCreateGroupBody=async(req,res,next)=>{
    try{
        const req_body=req.body;
        if(!req_body.userID){
            console.log("userID not provided for createGroup request")
            return res.status(400).send({
                message:"userID not provided for for createGroup request"
            })
        }
        if(!req_body.name){
            console.log("name not provided for createGroup request")
            return res.status(400).send({
                message:"name not provided for for createGroup request"
            })
        }
        if(!req_body.groupID){
            console.log("groupID not provided for createGroup request")
            return res.status(400).send({
                message:"groupID not provided for for createGroup request"
            })
        }
        if(!req_body.members){
            console.log("members not provided for createGroup request")
            return res.status(400).send({
                message:"members not provided for createGroup request"
            })
        }
        if(!req_body.members.includes(req_body.userID)){
            req.body.members.push(req_body.userID);
        }
        
    }catch(err){
        console.log("Error occured while checking createGroup body",err);
        return res.status(500).send({
            message:"Error occured while checking createGroup body"
        })
    }
    try{
        if(!req.headers["token"]){
            console.log("token not provided for createGroup request")
            return res.status(400).send({
                message:"token not provided for createGroup request"
            })
        }
        const token=req.headers["token"];
        const token_details=jwt.verify(token,secret.tokenSecret);
        if(token_details.userID!==req.body.userID){
            console.log("fraud aya kisi aur ka token leke group banane ke liye")
            return res.status(400).send({
                message:"bhakk saale fraud"
            })
        }
        req.user=token_details;
    }catch(err){
        console.log("Not a Valid token for createGroup request",err);
        return res.status(401).send({
            message:"Not a Valid token for createGroup request"
        })
    }
    try{
        const req_body=req.body;
        const groupExist=await group_model.findOne({groupID:req_body.groupID});
        if(groupExist){
            console.log("group with provided groupID already exists")
            return res.status(400).send({
                message:"group with provided groupID already exists"
            })
        }
        req_body.members.forEach(async member => {
            const user=await user_model.findOne({userID:member});
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