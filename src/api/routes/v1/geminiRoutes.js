const express = require("express");
const router = express.Router();
const geminiController = require("../../controllers/geminiController");

router.post("/", geminiController.getProductSummary);

module.exports = router;
