// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to get vehicle details by ID
router.get("/detail/:invId", invController.buildByInvId);

// Route to management view
router.get("/", invController.buildManagement);

// Route to add classification view
router.get("/add-classification", invController.buildAddClassification);

// Route to handle adding a classification
router.post("/add-classification", utilities.handleErrors(invController.addClassification));

// Route to display add inventory form
router.get('/add-inventory', invController.buildAddInventory);

// Route to handle add inventory form submission
router.post('/add-inventory', utilities.handleErrors(invController.addInventory));

//Get inventory for AJAX Route
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

module.exports = router;