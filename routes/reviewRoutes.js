const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities");

// Route to get reviews for a specific inventory item
router.get("/detail/:inv_id", utilities.handleErrors(reviewController.fetchReviews));

// Route to add a review for a specific inventory item
router.post("/detail/:inv_id", utilities.handleErrors(reviewController.addReview));

module.exports = router;