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
    // regular password and cost (salt is generated automatically)
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
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
    if(process.env.NODE_ENV === 'development') {
       res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
         res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    return res.redirect("/account/")
    }
    } catch (error) {
    return new Error('Access Forbidden')
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

        res.render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
            locals: {
                userId: accountData.account_id,
                userName: accountData.account_firstname,
                userLast: accountData.account_lastname,
                userEmail: accountData.account_email,
            }
        });
    } catch (error) {
        req.flash("notice", "There was an error loading your account information.");
        res.status(500).render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
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
            const updatedAccountData = await accountModel.getAccountById(account_id);

            req.flash("notice", "Account updated successfully.");
            return res.render("account/update", {
                title: "Update Account",
                nav,
                locals: {
                    userId: updatedAccountData.account_id,
                    userName: updatedAccountData.account_firstname,
                    userLast: updatedAccountData.account_lastname,
                    userEmail: updatedAccountData.account_email,
                },
                errors: null,
            });
        } else {
            req.flash("notice", "Sorry, the update failed.");
            res.status(501).render("account/update", {
                title: "Update Account",
                nav,
                errors: null,
                account_firstname,
                account_lastname,
                account_email,
                account_id,
            });
        }
    } catch (error) {
        req.flash("notice", "There was an error updating the account.");
        res.status(500).render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email,
            account_id,
        });
    }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, logout, buildUpdateAccount, updateAccount }