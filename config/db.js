require('dotenv').config();
const mongoose = require("mongoose");
function connectDB(){
    mongoose.connect(process.env.MONGO_CONNECTION_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("Database connected");
    }).catch(err => {
        console.error('Connection failed', err);
    });

}
module.exports = connectDB;