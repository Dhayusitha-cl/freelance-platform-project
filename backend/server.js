const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "freelance-platform-dev-secret";

// Middleware
app.use(cors());
app.use(express.json());

// Temporary in-memory user storage
const users = [];
const jobs = [];
const proposals = [];

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Registration and Login API are running"
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
    app.post("/api/proposals", (req, res) => {
  try {
    const {
      jobId,
      freelancerId,
      coverLetter,
      bidAmount
    } = req.body;

    if (!jobId || !freelancerId || !coverLetter || bidAmount === undefined) {
      return res.status(400).json({
        message: "Job ID, freelancer ID, cover letter, and bid amount are required"
      });
    }

    const job = jobs.find(existingJob => existingJob.id === Number(jobId));

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    const newProposal = {
      id: proposals.length + 1,
      jobId: Number(jobId),
      freelancerId: Number(freelancerId),
      coverLetter: coverLetter.trim(),
      bidAmount
    };

    proposals.push(newProposal);

    return res.status(201).json({
      message: "Proposal submitted successfully",
      proposal: newProposal
    });
  } catch (error) {
    console.error("Proposal submission error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

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
      (user) => user.email === normalizedEmail
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

    // Never send password/hash to client
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

// Login API with JWT
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Required-field validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = users.find(
      (existingUser) => existingUser.email === normalizedEmail
    );

    // Do not reveal whether email exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare password with hashed password
    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    // Successful login
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});
app.post("/api/jobs", (req, res) => {
  try {
    const {
      title,
      description,
      budget,
      deadline,
      category,
      skills
    } = req.body;

    if (!title || !description || !budget || !deadline || !category) {
      
      return res.status(400).json({
        message: "Title, description, budget, deadline, and category are required"
      });
    }
    if (typeof budget !== "number" || budget <= 0) {
  return res.status(400).json({
    message: "Budget must be a positive number"
  });
}

const deadlineDate = new Date(deadline);

if (isNaN(deadlineDate.getTime())) {
  return res.status(400).json({
    message: "Deadline must be a valid date"
  });
}

const today = new Date();
today.setHours(0, 0, 0, 0);

if (deadlineDate <= today) {
  return res.status(400).json({
    message: "Deadline must be a future date"
  });
}

    const newJob = {
      id: jobs.length + 1,
      title: title.trim(),
      description: description.trim(),
      budget,
      deadline,
      category: category.trim(),
      skills: skills ? skills.trim() : ""
    };

    jobs.push(newJob);

    return res.status(201).json({
      message: "Job created successfully",
      job: newJob
    });
  } catch (error) {
    console.error("Job creation error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});
// Proposal submission API
app.post("/api/proposals", (req, res) => {
  try {
    const {
      jobId,
      freelancerId,
      coverLetter,
      bidAmount
    } = req.body;

    if (!jobId || !freelancerId || !coverLetter || bidAmount === undefined) {
      return res.status(400).json({
        message: "Job ID, freelancer ID, cover letter, and bid amount are required"
      });
    }

    const job = jobs.find(
      (existingJob) => existingJob.id === Number(jobId)
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    const newProposal = {
      id: proposals.length + 1,
      jobId: Number(jobId),
      freelancerId: Number(freelancerId),
      coverLetter: coverLetter.trim(),
      bidAmount
    };

    proposals.push(newProposal);

    return res.status(201).json({
      message: "Proposal submitted successfully",
      proposal: newProposal
    });
  } catch (error) {
    console.error("Proposal submission error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});
// Start server when this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

module.exports = app;