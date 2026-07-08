const express = require("express");

const router = express.Router();

const qrController = require("../controllers/qrController");

// Create QR
router.post("/create", qrController.createQR);

// Get all QR codes
router.get("/all", qrController.getAllQR);

// Get Google Form responses
router.get("/responses", qrController.getResponses);

// Redirect QR
router.get("/r/:code", qrController.redirectQR);

router.delete("/delete/:id", qrController.deleteQR);

module.exports = router;