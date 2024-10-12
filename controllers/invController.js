const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);

    // Check if data is not empty
    if (!data || data.length === 0) {
        req.flash('notice', 'No vehicles found for this classification.');
        return res.redirect('/empty'); // Redirect to an empty page
    }

    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name; // Safe to access now

    res.render("./inventory/classification", {
        title: className + " Vehicles",
        nav,
        grid,
    });
};

/* ***************************
 *  Build vehicle detail view by inventory ID
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
    const invId = req.params.invId;
    const vehicleData = await invModel.getVehicleById(invId);
    const vehicleDetailHtml = await utilities.buildVehicleDetail(vehicleData);
    let nav = await utilities.getNav();
    const { inv_make, inv_model } = vehicleData;

    res.render("./inventory/detail", {
        title: `${inv_make} ${inv_model}`,
        nav,
        vehicleDetailHtml,
    });
};

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function(req, res, next) {
    let nav = await utilities.getNav();
    req.flash('notice');
    res.render("./inventory/management", {
        title: 'Vehicle Management',
        nav,
    });
};

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
        title: 'Add Classification',
        nav
    });
};

invCont.addClassification = async function(req, res, next) {
    try {
        const { classification_name } = req.body;

        // Server-side validation: Check for spaces or special characters
        const validName = /^[a-zA-Z]+$/.test(classification_name);
        if (!validName) {
            req.flash('notice', 'Provide a correct classification name.');
            return res.render("./inventory/add-classification", {
                title: 'Add Classification',
                nav: await utilities.getNav(),
                classification_name: classification_name // retain the input value
            });
        }

        const newClassification = await invModel.addClassification(classification_name);
        
        if (newClassification) {
            req.flash('notice', `The ${classification_name} was successfully added.`);
        } else {
            req.flash('notice', 'Failed to add classification. Please try again.');
        }

        res.redirect("/inv"); // Redirect to management view
    } catch (error) {
        req.flash('notice', 'Failed to add classification. Please try again.');
        res.render("./inventory/add-classification", {
            title: 'Add Classification',
            nav: await utilities.getNav(),
        });
    }
};

/* ***************************
 *  Build add vehicle view
 * ************************** */

invCont.buildAddInventory = async function (req, res, next) {
    try {
        let nav = await utilities.getNav(); // Get the navigation
        let classificationList = await utilities.buildClassificationList(); // Get the classification list
        // Render the add-inventory view with empty fields (initial form state)
        res.render("./inventory/add-inventory", {
            title: "Add New Vehicle",
            nav,
            classificationList,
            inv_make: '',
            inv_model: '',
            inv_description: '',
            inv_image: '',
            inv_thumbnail: '',
            inv_price: '',
            inv_year: '',
            inv_miles: '',
            inv_color: '',
        });
    } catch (error) {
        console.error('Error rendering add inventory view:', error);
        req.flash('notice', 'There was a problem rendering the add inventory page.');
        res.redirect('/inv');
    }
};

// Function to handle form submission
invCont.addInventory = async function(req, res, next) {
    try {
        const { inv_make, inv_model, inv_description, inv_year, inv_color, classification_id, inv_image, inv_thumbnail, inv_miles, inv_price } = req.body;

        // Server-side validation
        const errors = [];

        // Check if all required fields are present
        if (!inv_make || !inv_model || !inv_description || !inv_year || !inv_color || !classification_id || !inv_miles || !inv_price || !inv_image || !inv_thumbnail) {
            errors.push('All fields are required.');
        }

        // Make and Model validation: Must be more than 3 characters
        if (inv_make.length < 3 || inv_model.length < 3) {
            errors.push('Make and Model must be more than 3 characters long.');
        }

        // Year validation: Must be a 4-digit number between 1900 and 2100
        const yearRegex = /^(19|20)\d{2}$/;
        if (!yearRegex.test(inv_year) || inv_year < 1900 || inv_year > 2100) {
            errors.push('Year must be a 4-digit number between 1900 and 2100.');
        }

        // Numeric fields validation (Miles, Price): Must be integers, no alpha or special characters
        const numberRegex = /^\d+$/;
        if (!numberRegex.test(inv_miles)) {
            errors.push('Miles must be an integer.');
        }
        if (!numberRegex.test(inv_price)) {
            errors.push('Price must be an integer.');
        }

        // If there are errors, redirect back to the form with errors
        if (errors.length > 0) {
            // Pass the input values back to the view in case of validation errors
            let nav = await utilities.getNav();
            let classificationList = await utilities.buildClassificationList(classification_id);
        
            req.flash('notice', errors.join(' '));
        
            return res.render('inventory/add-inventory', {
                title: 'Add New Vehicle',
                nav,
                classificationList,
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
            });
        }

        // Add new vehicle to the database
        const newVehicle = await invModel.addInventory({
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
        });

        req.flash('notice', 'Vehicle successfully added to inventory.');
        res.redirect('/inv'); // Redirect to the inventory management view

    } catch (error) {
        req.flash('notice', 'Failed to add vehicle. Please try again.');
        res.redirect('/inv/add-inventory'); // Redirect back to the form
    }
};

module.exports = invCont;