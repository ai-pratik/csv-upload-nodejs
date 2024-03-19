const fs = require("fs"); // Import the file system module
const Papa = require("papaparse"); // Import the PapaParse library for CSV parsing
const { connectToMongoDB } = require("../models/csvModel"); // Import the function to connect to MongoDB from the model

// Controller function to handle CSV file upload
async function uploadCSV(req, res) {
  const file = req.file; // Get the uploaded file from the request

  // Check if a file was uploaded
  if (!file) {
    return res.status(400).send("Please upload a file"); // Return error if no file was uploaded
  }

  try {
    const data = fs.readFileSync(file.path, "utf8"); // Read the file synchronously
    const result = Papa.parse(data, { header: true }); // Parse the CSV data with PapaParse, assuming first row as header
    const fileName = file.originalname; // Get the original file name
    result.data.forEach((doc) => {
      doc.fileName = fileName; // Add fileName property to each document with the original file name
    });

    const db = await connectToMongoDB(); // Connect to MongoDB
    await db.collection("csvData").insertMany(result.data); // Insert parsed data into MongoDB collection
    res.redirect("/"); // Redirect to the home page after successful upload
  } catch (err) {
    console.error("Error processing uploaded file:", err); // Log error if file processing fails
    res.status(500).send("Error processing uploaded file"); // Send error response if file processing fails
  }
}

// Controller function to list uploaded CSV files
async function listFiles(req, res) {
  try {
    const db = await connectToMongoDB(); // Connect to MongoDB
    const files = await db.collection("csvData").distinct("fileName"); // Get distinct file names from MongoDB
    res.render("index", { files }); // Render the home page with the list of uploaded CSV files
  } catch (err) {
    console.error("Error retrieving file list from MongoDB:", err); // Log error if file list retrieval fails
    res.status(500).send("Error retrieving file list from MongoDB"); // Send error response if file list retrieval fails
  }
}

// Controller function to view CSV data
async function viewCSV(req, res) {
  const fileName = req.params.name; // Get the file name from request parameters
  try {
    const db = await connectToMongoDB(); // Connect to MongoDB
    const result = await db.collection("csvData").find({ fileName }).toArray(); // Find documents matching the file name
    if (result.length === 0) {
      return res.status(404).send("File not found"); // Return 404 if file not found
    }
    res.render("view_csv", { fileName, data: result }); // Render the view_csv page with file name and data
  } catch (err) {
    console.error("Error retrieving file data from MongoDB:", err); // Log error if file data retrieval fails
    res.status(500).send("Error retrieving file data from MongoDB"); // Send error response if file data retrieval fails
  }
}

// Export controller functions
module.exports = {
  uploadCSV,
  listFiles,
  viewCSV,
};
