const reviewModel = require("../models/review-model");

async function addReview(req, res, next) {
    const invId = req.params.inv_id;
    const { review_text } = req.body;

    try {
        const reviewId = await reviewModel.addReview(review_text, invId, res.locals.userId);
        console.log(`Review added with ID: ${reviewId}`); // Log the added review ID
        res.redirect(`/inv/detail/${invId}`); // Redirect back to the inventory detail page
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).send("There was an error adding your review."); // Handle the error
    }
}

async function fetchReviews(req, res, next) {
    const invId = req.params.inv_id; // Extract inv_id from the URL parameter

    try {
        // Fetch reviews based on inventory ID
        const reviews = await reviewModel.getReviewsByInvId(invId); 

        // Set reviews and inv_id in res.locals for the view
        res.locals.inv_id = invId; 
        res.locals.reviews = reviews; 

        // Render the detail view with reviews included
        res.render("inventory/detail", { 
            reviews, 
            vehicleData: res.locals.vehicleData // Include vehicleData if needed
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).send("There was an error fetching the reviews."); // Handle the error
    }
}


module.exports = { addReview, fetchReviews };