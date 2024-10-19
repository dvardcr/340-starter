// Needed resource - Utilities
const utilities = require("../utilities")
const accountModel = require('../models/account-model')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Process Registration Request
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
    // Hash the password before storing
    let hashedPassword
    try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
    })
    }
    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
    } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
        title: "Registration",
        nav,
    })
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
        delete accountData.account_password
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
        if(process.env.NODE_ENV === 'development') {
          res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
        } else {
          res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
        }
        return res.redirect("/account/")
    }
    else {
        req.flash("message notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        }
    } catch (error) {
        throw new Error('Access Forbidden')
    }
}

/* ****************************************
*  Deliver Account Management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav()
    const user = req.user;

    res.render("account/management", {
        title: "Account Management",
        nav,
        user,
        errors: null,
    })
}

/* ****************************************
*  Process Logout
* *************************************** */

async function logout(req, res) {
    res.clearCookie("jwt");
    req.flash("notice", "You have successfully logged out.");
    return res.redirect("/");
}

/* ****************************************
 *  Build Update Account View
 * *************************************** */
async function buildUpdateAccount(req, res, next) {
    let nav = await utilities.getNav();
    const account_id = req.params.account_id;

    try {
        const accountData = await accountModel.getAccountById(account_id);
        
        if (!accountData) {
            req.flash("notice", "Account not found.");
            return res.redirect("/account/");
        }

        // Use the middleware's populated values
        res.render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
            locals: {
                userId: accountData.account_id,
                userName: accountData.account_firstname,
                userLast: accountData.account_lastname,
                userEmail: accountData.account_email,
                isLoggedIn: true
            }
        });
    } catch (error) {
        req.flash("notice", "There was an error loading your account information.");
        console.error("Error fetching account data:", error);
        res.status(500).render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
            locals: {
                isLoggedIn: false
            }
        });
    }
}

/* ****************************************
 * Update Account
 * *************************************** */
async function updateAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_id } = req.body;

    try {
        const updateResult = await accountModel.updateAccount(
            account_firstname, 
            account_lastname, 
            account_email, 
            account_id
        );

        if (updateResult) {
            // Fetch the updated account data
            const updatedAccountData = await accountModel.getAccountById(account_id);

            // Regenerate JWT with updated information
            const updatedJwt = jwt.sign(
                {
                    account_id: updatedAccountData.account_id,
                    account_firstname: updatedAccountData.account_firstname,
                    account_lastname: updatedAccountData.account_lastname,
                    account_email: updatedAccountData.account_email,
                    account_type: updatedAccountData.account_type
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1h' }
            );

            // Set the updated token as a cookie
            res.cookie('jwt', updatedJwt, { httpOnly: true });

            // Set updated user information in res.locals to refresh the header
            res.locals.userName = updatedAccountData.account_firstname;
            res.locals.userLast = updatedAccountData.account_lastname;
            res.locals.userEmail = updatedAccountData.account_email;

            req.flash("notice", "Account updated successfully.");
            return res.redirect("/account/");
        } else {
            req.flash("notice", "Sorry, the update failed.");
            return res.status(501).render("account/update", {
                title: "Update Account",
                nav,
                locals: {
                    isLoggedIn: true,
                    userName: res.locals.userName || account_firstname
                },
                account_firstname,
                account_lastname,
                account_email,
                account_id,
                errors: null,
            });
        }
    } catch (error) {
        req.flash("notice", "There was an error updating the account.");
        return res.status(500).render("account/update", {
            title: "Update Account",
            nav,
            locals: {
                isLoggedIn: true,
                userName: res.locals.userName || account_firstname
            },
            account_firstname,
            account_lastname,
            account_email,
            account_id,
            errors: null,
        });
    }
}

/* ****************************************
 * Update Password
 * *************************************** */
async function changePassword(req, res) {
    const { account_id, account_password } = req.body;

    // Validate password
    if (account_password.length < 12) {
        req.flash("notice", "Password must be at least 12 characters long.");
        return res.redirect("/account/management"); // Redirect back to management
    }

    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(account_password, 10);
        // Update the password in the database
        const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

        if (updateResult) {
            req.flash("notice", "Password updated successfully. Please login with your new password.");
            // Log the user out after updating the password
            res.clearCookie("jwt"); // Clear the JWT cookie
            return res.redirect("/account/login"); // Redirect to login
        } else {
            req.flash("notice", "Sorry, the password update failed.");
        }
    } catch (error) {
        req.flash("notice", "There was an error updating the password.");
        console.error("Password update error:", error); // Log the error for debugging
    }

    // If we reach here, something went wrong. Redirect back to management.
    return res.redirect("/account/management");
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, logout, buildUpdateAccount, updateAccount, changePassword }