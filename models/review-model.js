const pool = require("../database");

const reviewModel = {};

/* ***************************
 *  Add a review to the database
 *************************** */
reviewModel.addReview = async (reviewText, invId, accountId) => {
    const query = `
        INSERT INTO review (review_text, inv_id, account_id)
        VALUES ($1, $2, $3)
        RETURNING review_id;
    `;
    const values = [reviewText, invId, accountId];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0].review_id;
    } catch (error) {
        console.error("Error adding review:", error);
        throw error;
    }
};

/* ***************************
 *  Get reviews by inventory ID
 *************************** */
reviewModel.getReviewsByInvId = async (invId) => {
    const query = `
        SELECT r.review_text, r.review_date, a.account_firstname AS first_name, a.account_lastname AS last_name
        FROM review r
        JOIN account a ON r.account_id = a.account_id
        WHERE r.inv_id = $1
        ORDER BY r.review_date DESC;    
    `;
    const values = [invId];

    try {
        const result = await pool.query(query, values);
        console.log(result.rows); // Log the result rows
        return result.rows; // Return the rows from the result
    } catch (error) {
        console.error("Error fetching reviews:", error);
        throw error; // Rethrow the error for handling in the controller
    }
};

module.exports = reviewModel;