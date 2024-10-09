// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")

// Route to display "Account" page
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to display "Registration" page
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to POST "Registration" form
router.post('/register', utilities.handleErrors(accountController.registerAccount))

module.exports = router;