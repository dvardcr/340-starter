// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation');

// Route to display "Account" page
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to display "Registration" page
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to display "Account Management" page
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

// Route to POST "Registration" form
router.post('/register', regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount))

// Process the login request
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

// Route to handle the Edit Account Information
router.get("/update/:account_id", regValidate.loginRules(), utilities.handleErrors(accountController.buildUpdateAccount))

// Route to process the Account Update form
router.post("/update", regValidate.loginRules(), utilities.handleErrors(accountController.updateAccount)
);

// Process Password Update
router.post("/change-password", utilities.handleErrors(accountController.changePassword));

// Process to Logout
router.get("/logout", utilities.handleErrors(accountController.logout))

module.exports = router;