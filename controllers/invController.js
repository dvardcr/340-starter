const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
    title: className + " Vehicles",
    nav,
    grid,
})
}

/* ***************************
 *  Build vehicle detail view by inventory ID
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
    const invId = req.params.invId;
    const vehicleData = await invModel.getVehicleById(invId); // Model call
    const vehicleDetailHtml = await utilities.buildVehicleDetail(vehicleData); // Utility function to wrap the data in HTML
    let nav = await utilities.getNav(); // Reuse nav
    const { inv_make, inv_model } = vehicleData;
    
    res.render("./inventory/detail", {
        title: `${inv_make} ${inv_model}`,
        nav,
        vehicleDetailHtml,
    });
};

module.exports = invCont