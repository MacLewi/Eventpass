const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

router.get("/", async(req,res)=>{

    const events = await Event.find();

    res.json(events);

});

router.post("/", async(req,res)=>{

    const newEvent = new Event(req.body);

    const saved = await newEvent.save();

    res.json(saved);

});

module.exports = router;