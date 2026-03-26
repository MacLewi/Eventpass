const mongoose = require('mongoose');
// const connect = mongoose.connect('mongodb://root:example@mongo:27017/');

// //check database connected or not
// connect.then(() => {
//     console.log("Database connected successfully");
// }).catch((err) => {
//     console.log("Database connection failed", err);
// });

// create schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true   // added (important)
    },
    email: {
        type: String,
        required: true,
        unique: true     // prevents duplicate users
    },
    password: {
        type: String,
        required: true
    }
});

// collection part
const collection = mongoose.model('users', userSchema);
module.exports = collection;
