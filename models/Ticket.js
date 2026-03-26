const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({

userId:{
type:String,
required:true
},

eventId:{
type:String,
required:true
},

purchaseDate:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Ticket",TicketSchema);