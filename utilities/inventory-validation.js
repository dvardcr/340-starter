function checkUpdateData(req, res, next) {
    const { inv_id, make, model, year, price, color, miles, description } = req.body;

    let errors = [];

    if (!make || !model || !year || !price || !color || !miles || !description) {
        errors.push("All fields are required.");
    }

    if (!Number.isInteger(Number(year)) || year < 1900 || year > 2100) {
        errors.push("Please provide a valid year between 1900 and 2100.");
    }

    if (!Number.isInteger(Number(price)) || !Number.isInteger(Number(miles))) {
        errors.push("Price and miles should be valid numbers.");
    }

    if (errors.length > 0) {
        req.flash("notice", errors.join(" "));
        return res.render("./inventory/edit", {
            title: "Edit Vehicle",
            inv_id,
            make,
            model,
            year,
            price,
            color,
            miles,
            description,
            nav,
        });
    }

    next();
}

module.exports = { checkUpdateData };