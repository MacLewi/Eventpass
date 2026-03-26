const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");

router.post("/book", async(req,res)=>{

const {userId,eventId} = req.body;

const ticket = new Ticket({
userId,
eventId
});

await ticket.save();

res.json({message:"Ticket booked successfully"});

});

module.exports = router;