const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Frontend validation
    if (email === "") {
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

    loginMessage.textContent = "Logging in...";

    try {
        // Send login request to backend
        const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        // Handle login failure
        if (!response.ok) {
            loginMessage.textContent = data.message || "Login failed.";
            return;
        }

        // Store JWT token
        localStorage.setItem("token", data.token);

        // Store logged-in user information
        localStorage.setItem("user", JSON.stringify(data.user));

        // Read the user's role
        const role = data.user.role;

        // Role-based redirect
        if (role === "client") {
            window.location.href = "client-dashboard.html";
        } else if (role === "freelancer") {
            window.location.href = "freelancer-dashboard.html";
        } else {
            loginMessage.textContent = "Invalid user role.";
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }

    } catch (error) {
        console.error("Login error:", error);
        loginMessage.textContent =
            "Unable to connect to the server. Please try again.";
    }
});