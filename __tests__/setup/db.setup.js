const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

//Start in-meomory mongo server

const connectTestDB = async () => {
    mongoServer = await MongoMemoryServer.create({
        binary: { version: "7.0.14" },
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
}

//Clear collections after each test

const clearTestDB = async () =>{
    const collections = mongoose.connection.collections;
    for (const key in collections){
        await collections[key].deleteMany({});
    }
}

//Close DB after end of each test

const closeTestDB = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
};

module.exports = {connectTestDB, clearTestDB, closeTestDB}

