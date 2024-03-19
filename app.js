const express = require("express");
const path = require("path");
const csvRoutes = require("./routes/csvRoutes");

const app = express();
const port = process.env.PORT || 4600;

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// Route for CSV operations
app.use("/", csvRoutes);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
