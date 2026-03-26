const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true
    },

    date:{
        type:String,
        required:true
    },

    location:{
        type:String,
        required:true
    },

    price:{
        type:Number,
        required:true
    }

});

module.exports = mongoose.model("Event", EventSchema);