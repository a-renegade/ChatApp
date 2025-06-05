const express = require('express')
const router = express.Router()
const authController=require("../controllers/auth.controller")
const authMiddleware=require("../middlewares/auth.middleware")
router.post("/signup",[authMiddleware.signUp],authController.signUp);
router.post("/signin",[authMiddleware.signIn],authController.signIn);
router.post("/logout",authController.logout);


router.get("/check",authController.authCheck);

module.exports=router; 