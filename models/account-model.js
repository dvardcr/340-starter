const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        return error.message
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
    try {
      const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
    } catch (error) {
    return error.message
    }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using id
* ***************************** */

async function getAccountById(account_id) {
  try {
      const result = await pool.query(
          'SELECT * FROM account WHERE account_id = $1', 
          [account_id]
      );
      return result.rows[0];
  } catch (error) {
      console.log('Error fetching account by ID:', error);
      throw new Error('Database query failed');
  }
}

/* *****************************
*   Update existing account
* *************************** */
async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
  try {
      const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4";
      const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
      return result.rowCount > 0;
  } catch (error) {
      return error.message;
  }
}

/* *****************************
*   Update password
* *************************** */
async function updatePassword(account_id, hashedPassword) {
  const query = 'UPDATE account SET account_password = $1 WHERE account_id = $2';
  const values = [hashedPassword, account_id];
  const result = await pool.query(query, values);
  return result.rowCount > 0;
}

async function getReviewsByAccountId(account_id) {
  try {
      const result = await pool.query(
          `SELECT r.review_id, r.review_text, r.review_date, 
          i.inv_year, i.inv_make, i.inv_model
          FROM review r
          JOIN inventory i ON r.inv_id = i.inv_id
          WHERE r.account_id = $1`,
          [account_id]
      );
      return result.rows;
  } catch (error) {
      console.log('Error fetching reviews:', error);
      throw new Error('Database query failed');
  }
}

async function getReviewById(review_id) {
  try {
      const result = await pool.query(
          'SELECT r.*, i.inv_year, i.inv_make, i.inv_model FROM review r JOIN inventory i ON r.inv_id = i.inv_id WHERE r.review_id = $1',
          [review_id]
      );
      return result.rows[0]; // Return the review object
  } catch (error) {
      console.log('Error fetching review by ID:', error);
      throw new Error('Database query failed');
  }
}

async function updateReview(review_id, account_id, review_text) {
  console.log(`Update function called with review_id: ${review_id}, account_id: ${account_id}, review_text: ${review_text}`); // Debugging log

  try {
      const result = await pool.query(
          'UPDATE review SET review_text = $1 WHERE review_id = $2 AND account_id = $3',
          [review_text, review_id, account_id]
      );

      console.log(`Rows updated: ${result.rowCount}`); // Debugging log

      if (result.rowCount === 0) {
          throw new Error('No rows updated. Review may not exist for this user.');
      }
  } catch (error) {
      console.log('Error updating review:', error);
      throw new Error('Database query failed');
  }
}

async function deleteReview(review_id, account_id) {
  try {
    const result = await pool.query(
      'DELETE FROM review WHERE review_id = $1 AND account_id = $2',
      [review_id, account_id]
    );
    return result;
  } catch (error) {
    console.log("Error deleting review:", error);
    throw new Error("Database query failed");
  }
}


module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, updateAccount, getAccountById, updatePassword, getReviewsByAccountId, getReviewById, updateReview, deleteReview }