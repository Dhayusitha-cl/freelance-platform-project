const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Temporary in-memory user storage
const users = [];

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Registration API is running"
    });
});

// Registration API
app.post("/api/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            confirmPassword,
            role
        } = req.body;

        // Required-field validation
        if (!name || !email || !password || !confirmPassword || !role) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedRole = role.trim().toLowerCase();

        // Name validation
        if (normalizedName.length < 2) {
            return res.status(400).json({
                message: "Name must contain at least 2 characters"
            });
        }

        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            });
        }

        // Password validation
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        // Role validation
        const allowedRoles = ["client", "freelancer"];

        if (!allowedRoles.includes(normalizedRole)) {
            return res.status(400).json({
                message: "Role must be either client or freelancer"
            });
        }

        // Duplicate email validation
        const existingUser = users.find(
            user => user.email === normalizedEmail
        );

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store user
        const newUser = {
            id: users.length + 1,
            name: normalizedName,
            email: normalizedEmail,
            password: hashedPassword,
            role: normalizedRole
        };

        users.push(newUser);

        // Never send password/hash to the client
        return res.status(201).json({
            message: "Registration successful",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Registration API running on http://localhost:${PORT}`);
});