const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", function (event) {
event.preventDefault();


const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const email = emailInput.value;
const password = passwordInput.value;

if (email.trim() === "") {
    loginMessage.textContent = "Please enter your email.";
    return;
}

if (password === "") {
    loginMessage.textContent = "Please enter your password.";
    return;
}

if (password.length < 8) {
    loginMessage.textContent = "Password must be at least 8 characters.";
    return;
}

loginMessage.textContent = "Login form submitted successfully.";

});
