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

// Route to display "Account Management" page
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

// Route to POST "Registration" form
router.post('/register', regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount))

// Process the login attempt
router.post(
    "/login", regValidate.loginRules(), regValidate.checkLoginData, 
    utilities.handleErrors(accountController.accountLogin)
)

// Process to Logout
router.get("/logout", utilities.handleErrors(accountController.logout))

// Route to handle the Edit Account Information
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount))

// Route to process the Account Update form
router.post("/update/:account_id", 
    utilities.checkLogin, 
    regValidate.accountUpdateRules(),
    regValidate.checkAccountUpdateData,
    utilities.handleErrors(accountController.updateAccount)
);

module.exports = router;