const express = require('express')
const router = express.Router()
const auth_controller=require("../controllers/auth.controller")
const auth_middleware=require("../middlewares/auth.middleware")
router.post("/signup",[auth_middleware.signUp],auth_controller.signUp);
router.post("/signin",[auth_middleware.signIn],auth_controller.signIn);
module.exports=router; 