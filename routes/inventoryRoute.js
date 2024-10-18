// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to get vehicle details by ID
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId))

// Route to management view
router.get("/", utilities.checkLogin, utilities.handleErrors(invController.buildManagement))

// Route to add classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

// Route to handle adding a classification
router.post("/add-classification", utilities.handleErrors(invController.addClassification))

// Route to display add inventory form
router.get('/add-inventory', utilities.handleErrors(invController.buildAddInventory))

// Route to handle add inventory form submission
router.post('/add-inventory', utilities.handleErrors(invController.addInventory))

//Get inventory for AJAX Route
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to edit vehicle information by inventory ID
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView))

// Route to handle the incoming update request
router.post("/edit-inventory", utilities.handleErrors(invController.updateInventory))

// Route to delete confirmation
router.get('/delete/:inv_id', utilities.handleErrors(invController.deleteConfirmation))

// Route to post delete confirmation
router.post('/delete/', utilities.handleErrors(invController.deleteInventory))

module.exports = router;