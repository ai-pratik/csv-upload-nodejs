const express = require("express");
const multer = require("multer");
const Papa = require("papaparse");
const { MongoClient } = require("mongodb");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3300;

// Set EJS as the view engine
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

const mongoURI =
  "mongodb+srv://pratikgade5151:root@cluster0.tpg3eyl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "csvUploader";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

async function connectToMongoDB() {
  try {
    const client = await MongoClient.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected successfully to MongoDB");
    return client.db(dbName);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
}

app.get("/", async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const files = await db.collection("csvData").distinct("fileName");
    res.render("index", { files }); // Render the home page with the list of uploaded CSV files
  } catch (err) {
    console.error("Error retrieving file list from MongoDB:", err);
    res.status(500).send("Error retrieving file list from MongoDB");
  }
});

app.post("/upload", upload.single("csvFile"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send("Please upload a file");
  }

  try {
    const data = fs.readFileSync(file.path, "utf8");
    const result = Papa.parse(data, { header: true });
    const fileName = file.originalname;
    result.data.forEach((doc) => {
      doc.fileName = fileName;
    });
    const db = await connectToMongoDB();
    await db.collection("csvData").insertMany(result.data);
    res.redirect("/");
  } catch (err) {
    console.error("Error processing uploaded file:", err);
    res.status(500).send("Error processing uploaded file");
  }
});

app.get("/files", async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const files = await db.collection("csvData").distinct("fileName");
    res.json(files);
  } catch (err) {
    console.error("Error retrieving file list from MongoDB:", err);
    res.status(500).send("Error retrieving file list from MongoDB");
  }
});

app.get("/file/:name", async (req, res) => {
  const fileName = req.params.name;
  try {
    const db = await connectToMongoDB();
    const result = await db.collection("csvData").find({ fileName }).toArray();
    res.json(result);
  } catch (err) {
    console.error("Error retrieving file data from MongoDB:", err);
    res.status(500).send("Error retrieving file data from MongoDB");
  }
});

app.get("/view/:name", async (req, res) => {
  const fileName = req.params.name;
  try {
    const db = await connectToMongoDB();
    const result = await db.collection("csvData").find({ fileName }).toArray();
    if (result.length === 0) {
      return res.status(404).send("File not found");
    }
    res.render("view_csv", { fileName, data: result });
  } catch (err) {
    console.error("Error retrieving file data from MongoDB:", err);
    res.status(500).send("Error retrieving file data from MongoDB");
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
