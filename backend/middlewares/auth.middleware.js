
const user_model=require("../models/user_model")
const signUp=async (req,res,next)=>{
    
    try{
        
        let req_body=req.body;
        console.log(req_body);
        if(!req_body.firstName){
            console.log("firstName not provided for signUP");
            return res.status(400).send({
                message:"firstName not provided for signUP",
            })
        }
        if(!req_body.userID){
            console.log("userID not provided for signUP");
            return res.status(400).send({
                message:"userID not provided for signUP",
            })
        }
        if(!req_body.email){
            console.log("email not provided for signUP");
            return res.status(400).send({
                message:"email not provided for signUP",
            })
        }
        if(!req_body.password){
            console.log("password not provided for signUP");
            return res.status(400).send({
                message:"password not provided for signUP",
            })
        }
        const user1=await user_model.findOne({userID:req_body.userID});
        if(user1){
            console.log("user with provided userID already exist",req_body.userID);
            return res.status(400).send({
                message:"user with provided userID already exist",
            })
        }
        const user2=await user_model.findOne({email:req_body.email});
        if(user2){
            console.log("user with provided email already exist",req_body.email);
            return res.status(400).send({
                message:"user with provided email already exist",
            })
        }
        next();

    }catch(err){
        console.log("Error occured while verifying signUp body",err);
        return res.status(500).send({
            message:"Error occured while verifying signUp body",
        })
    }
}
const signIn=async(req,res,next)=>{
    try{
        const req_body=req.body;
        if(!req_body.email&&!req_body.userID){
            return res.status(400).send({
                message:"Neither email ID provided nor userID"
            })
        }
        if(!req_body.password){
            return res.status(400).send({
                message:"password not provided for login"
            })
        }
        if(req_body.userID){
            const user=await user_model.findOne({userID:req_body.userID});
            if(!user){
                return res.status(401).send({
                    message:"user with provided userID does not exist"
                })
            }
        }else{
            const user=await user_model.findOne({email:req_body.email});
            if(!user){
                return res.status(401).send({
                    message:"user with provided email does not exist"
                })
            }
        }
        next();
    }catch(err){
        console.log("Error occured while verifying signIn body",err)
        res.status(500).send({
            message:"Error occured while verifying signIn body"
        })
    }
}
module.exports={
    signUp:signUp,
    signIn:signIn,
}