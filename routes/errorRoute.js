const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController");

// Route to trigger the intentional error
router.get("/trigger-error", errorController.triggerError);

module.exports = router;