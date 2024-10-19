document.addEventListener("DOMContentLoaded", function () {
    const passwordInput = document.querySelector("#account_password");
    const updateBtn = document.querySelector("#password-form button[type='submit']");

    passwordInput.addEventListener("input", function () {
        if (passwordInput.validity.valid) {
            updateBtn.removeAttribute("disabled");
        } else {
            updateBtn.setAttribute("disabled", "disabled");
        }
    });
});
