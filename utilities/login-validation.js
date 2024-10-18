const { body, validationResult } = require("express-validator");
const validate = {};

// Login Data Validation Rules
validate.loginRules = () => {
    return [
        body("account_email")
            .trim()
            .notEmpty()
            .isEmail()
            .withMessage("A valid email is required."),
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ];
};

// Middleware to check for errors in login
validate.checkLoginData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/login", {
            errors: errors.array(),
            title: "Login",
            nav,
            account_email: req.body.account_email,
        });
        return;
    }
    next();
};

module.exports = validate;