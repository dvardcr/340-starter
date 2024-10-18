const pool = require("../database/")
const invModel = {};

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get vehicle data by inventory ID
 * ************************** */
async function getVehicleById(invId) {
  try {
    const sql = "SELECT * FROM public.inventory WHERE inv_id = $1";
    const result = await pool.query(sql, [invId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching vehicle by ID:", error);
    throw error;
  }
}

/* ***************************
 *  Add new classification to the database
 * ************************** */
async function addClassification(new_classification) {
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *";
    return await pool.query(sql, [new_classification]);
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Add new vehicle to the database
 * ************************** */

async function addInventory(vehicleData) {
  try {
    const {
      inv_make,
      inv_model,
      inv_description,
      inv_year,
      inv_color,
      classification_id,
      inv_image,
      inv_thumbnail,
      inv_miles,
      inv_price
    } = vehicleData;

    // Insert the new vehicle into the database
    const query = `
      INSERT INTO public.inventory (inv_make, inv_model, inv_description, inv_year, inv_color, classification_id, inv_image, inv_thumbnail, inv_miles, inv_price)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
    `;

    const result = await pool.query(query, [
      inv_make,
      inv_model,
      inv_description,
      inv_year,
      inv_color,
      classification_id,
      inv_image,
      inv_thumbnail,
      inv_miles,
      inv_price
    ]);

    return result.rows[0]; // Return the inserted vehicle data
  } catch (error) {
    console.error("Error adding vehicle:", error);
    throw error; // Throw the error for handling in the controller
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM public.inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
  return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventory, updateInventory, deleteInventory};