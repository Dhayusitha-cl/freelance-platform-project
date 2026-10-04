const registrationForm = document.getElementById("registrationForm");
const message = document.getElementById("message");

registrationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;

    if (name === "") {
        message.textContent = "Please enter your name.";
        return;
    }

    if (email === "") {
        message.textContent = "Please enter your email.";
        return;
    }

    if (password === "") {
        message.textContent = "Please enter your password.";
        return;
    }

    if (confirmPassword === "") {
        message.textContent = "Please confirm your password.";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        return;
    }

    if (password.length < 8) {
        message.textContent = "Password must be at least 8 characters.";
        return;
    }

    if (!role) {
        message.textContent = "Please select a role.";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password,
                confirmPassword,
                role
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Registration failed.";
            return;
        }

        message.textContent = data.message || "Registration successful.";

        registrationForm.reset();
    } catch (error) {
        console.error("Registration error:", error);
        message.textContent =
            "Unable to connect to the registration server.";
    }
});