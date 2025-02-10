const group_model=require("../models/group.model");

const createGroup=async(req,res)=>{
    try{
        const req_body=req.body;
        const groupDetails={
            groupID:req_body.groupID,
            admin:req_body.userID,
            name:req_body.name,
            members:req_body.members,
        }
        if(req_body.bio)groupDetails.bio=req_body.bio;
        const groupCreated=await group_model.create(groupDetails);
        console.log("Group successfully created")
        res.status(201).send(groupCreated);
    }catch(err){
        console.log("Error occured while creating group",err);
        res.status(500).send({
            message:"Error occured while creating group"
        });
    }
}

module.exports={
    createGroup:createGroup,
}
