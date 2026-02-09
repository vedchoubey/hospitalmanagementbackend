// const mongoose = require("mongoose");
// const User = require("./models/userModel");

// mongoose.connect("mongodb://127.0.0.1:27017/hospital");

// async function test() {
//   const user = await User.create({
//     name: "Rahul",
//     email: "rahul@test.com",
//     password: "12345678"
//   });

//   console.log(user);
// }

// test();


const mongoose = require("mongoose");
const User = require("./models/userModel");

mongoose.connect("mongodb://127.0.0.1:27017/hospital");

async function test() {

  const user = await User.findOne({
    email: "rahul@test.com"
  });

  const isMatch = await user.comparePassword("12345678");

  console.log("Password match:", isMatch);
}

test();
