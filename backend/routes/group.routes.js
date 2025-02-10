const group_controller=require("../controllers/group.controller")
const group_mw=require("../middlewares/group.mw");
const express=require("express")
const router=express.Router();
router.post("/create",[group_mw.verifyCreateGroupBody],group_controller.createGroup);
module.exports=router;