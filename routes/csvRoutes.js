const express = require("express");
const multer = require("multer");
const csvController = require("../controllers/csvController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", csvController.listFiles);
router.post("/upload", upload.single("csvFile"), csvController.uploadCSV);
router.get("/view/:name", csvController.viewCSV);

module.exports = router;
