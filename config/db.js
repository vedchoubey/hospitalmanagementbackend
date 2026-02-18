const mongoose = require("mongoose");
const dotenv = require("dotenv");

//load env
dotenv.config();

const connectDB = async () => {

      console.log("MONGO URI:", process.env.MONGODB_URI); // 👈 LOG HERE
    try{
        const conn = await mongoose.connect(
         process.env.MONGODB_URI
        )
        console.log(`MongoDB connected : ${conn.connection.host} `);
        

    }
    catch(err){
        console.error(err.message);
        process.exit(1);

    }

}

   module.exports = connectDB;