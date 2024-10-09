// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// Route to display "Account" page
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to display "Registration" page
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to POST "Registration" form
router.post('/register', regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount))

// Process the login attempt
router.post(
    "/login", regValidate.loginRules(), regValidate.checkLogData, 
    (req, res) => {
    res.status(200).send('login process')
    }
)

module.exports = router;