// Import MongoClient from the MongoDB package
const { MongoClient } = require("mongodb");

// MongoDB connection URI
const mongoURI =
  "mongodb+srv://pratikgade5151:root@cluster0.tpg3eyl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Name of the MongoDB database
const dbName = "csvUploader";

// Asynchronous function to connect to MongoDB
async function connectToMongoDB() {
  try {
    // Connect to MongoDB using MongoClient's connect method
    const client = await MongoClient.connect(mongoURI, {
      useNewUrlParser: true, // Use new URL parser
      useUnifiedTopology: true, // Use new Server Discover and Monitoring engine
    });

    // Log successful connection to MongoDB
    console.log("Connected successfully to MongoDB");

    // Return the database instance
    return client.db(dbName);
  } catch (err) {
    // If an error occurs during connection, log the error and throw it
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
}

// Export the connectToMongoDB function to be used in other modules
module.exports = {
  connectToMongoDB,
};
