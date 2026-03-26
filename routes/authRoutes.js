const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async(req,res)=>{

    const user = new User(req.body);

    await user.save();

    res.json({message:"User registered"});

});

router.post("/login", async(req,res)=>{

    const {email,password} = req.body;

    const user = await User.findOne({email,password});

    if(!user){
        return res.json({message:"Invalid login"});
    }

    res.json(user);

});

module.exports = router;