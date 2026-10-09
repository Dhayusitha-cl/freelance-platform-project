const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET =
  process.env.JWT_SECRET || "freelance-platform-dev-secret";

// Middleware
app.use(cors());
app.use(express.json());

// Temporary in-memory storage
const users = [];
const jobs = [];
const proposals = [];
const notifications = [];

// =========================
// HEALTH CHECK
// =========================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Registration and Login API are running"
  });
});

// =========================
// REGISTRATION API
// =========================

app.post("/api/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      role
    } = req.body;

    // Required fields
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

    // Email validation
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

    // Create user
    const newUser = {
      id: users.length + 1,
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole
    };

    users.push(newUser);

    // Never return password
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

// =========================
// LOGIN API
// =========================

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Required fields
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

    // Invalid credentials
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Check password
    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Generate JWT
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

// =========================
// JOB CREATION API
// =========================

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

    // Required fields
    if (
      !title ||
      !description ||
      budget === undefined ||
      budget === null ||
      !deadline ||
      !category
    ) {
      return res.status(400).json({
        message:
          "Title, description, budget, deadline, and category are required"
      });
    }

    // Budget validation
    if (typeof budget !== "number" || budget <= 0) {
      return res.status(400).json({
        message: "Budget must be a positive number"
      });
    }

    // Deadline validation
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

    // Create job
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

// =========================
// PROPOSAL SUBMISSION API
// =========================

app.post("/api/proposals", (req, res) => {
  try {
    const {
      jobId,
      freelancerId,
      coverLetter,
      bidAmount
    } = req.body;

    // Required fields
    if (
      jobId === undefined ||
      jobId === null ||
      freelancerId === undefined ||
      freelancerId === null ||
      !coverLetter ||
      bidAmount === undefined ||
      bidAmount === null
    ) {
      return res.status(400).json({
        message:
          "Job ID, freelancer ID, cover letter, and bid amount are required"
      });
    }

    // Job ID validation
    if (
      typeof jobId !== "number" ||
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      return res.status(400).json({
        message: "Job ID must be a positive integer"
      });
    }

    // Freelancer ID validation
    if (
      typeof freelancerId !== "number" ||
      !Number.isInteger(freelancerId) ||
      freelancerId <= 0
    ) {
      return res.status(400).json({
        message: "Freelancer ID must be a positive integer"
      });
    }

    // Cover letter validation
    if (
      typeof coverLetter !== "string" ||
      !coverLetter.trim()
    ) {
      return res.status(400).json({
        message: "Cover letter is required"
      });
    }

    // Bid amount validation
    if (
      typeof bidAmount !== "number" ||
      !Number.isFinite(bidAmount) ||
      bidAmount <= 0
    ) {
      return res.status(400).json({
        message: "Bid amount must be a positive number"
      });
    }

    // Check job exists
    const job = jobs.find(
      (existingJob) => existingJob.id === jobId
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found"
      });
    }

    // Check freelancer exists
    const freelancer = users.find(
      (user) =>
        user.id === freelancerId &&
        user.role === "freelancer"
    );

    if (!freelancer) {
      return res.status(404).json({
        message: "Freelancer not found"
      });
    }

    // Prevent duplicate proposal
    const existingProposal = proposals.find(
      (proposal) =>
        proposal.jobId === jobId &&
        proposal.freelancerId === freelancerId
    );

    if (existingProposal) {
      return res.status(409).json({
        message:
          "Freelancer has already submitted a proposal for this job"
      });
    }

    // Create proposal
    const newProposal = {
      id: proposals.length + 1,
      jobId,
      freelancerId,
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
 
 // =========================
// PROPOSAL ACCEPTANCE AND NOTIFICATION API
// =========================

app.post("/api/proposals/:id/accept", (req, res) => {
  const proposalId = Number(req.params.id);

  if (!Number.isInteger(proposalId) || proposalId <= 0) {
    return res.status(400).json({
      message: "Invalid proposal ID"
    });
  }

  const proposal = proposals.find(
    (item) => item.id === proposalId
  );

  if (!proposal) {
    return res.status(404).json({
      message: "Proposal not found"
    });
  }

  if (proposal.status === "accepted") {
    return res.status(409).json({
      message: "Proposal already accepted"
    });
  }

  const job = jobs.find(
    (item) => item.id === proposal.jobId
  );

  if (!job) {
    return res.status(404).json({
      message: "Job not found"
    });
  }

  proposal.status = "accepted";

  const notification = {
    id: notifications.length + 1,
    userId: proposal.freelancerId,
    type: "proposal_accepted",
    message: `Your proposal for "${job.title}" has been accepted.`,
    proposalId: proposal.id,
    jobId: proposal.jobId,
    read: false,
    createdAt: new Date().toISOString()
  };

  notifications.push(notification);

  return res.status(200).json({
    message: "Proposal accepted and notification created",
    proposal,
    notification
  });
});

// =========================
// GET USER NOTIFICATIONS
// =========================

app.get("/api/notifications/:userId", (req, res) => {
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      message: "Invalid user ID"
    });
  }

  const user = users.find((item) => item.id === userId);

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  const userNotifications = notifications.filter(
    (item) => item.userId === userId
  );

  return res.status(200).json({
    notifications: userNotifications
  });
});  
// =========================
// FREELANCER PROFILE API
// =========================

app.get("/api/freelancers/:id", (req, res) => {
  try {
    const freelancerId = Number(req.params.id);

    // ID validation
    if (
      !Number.isInteger(freelancerId) ||
      freelancerId <= 0
    ) {
      return res.status(400).json({
        message: "Freelancer ID must be a positive integer"
      });
    }

    // Find freelancer
    const freelancer = users.find(
      (user) => user.id === freelancerId
    );

    // User does not exist
    if (!freelancer) {
      return res.status(404).json({
        message: "Freelancer not found"
      });
    }

    // User exists but is not a freelancer
    if (freelancer.role !== "freelancer") {
      return res.status(404).json({
        message: "Freelancer not found"
      });
    }

    // Return public freelancer profile
    return res.status(200).json({
      freelancer: {
        id: freelancer.id,
        name: freelancer.name,
        email: freelancer.email,
        role: freelancer.role
      }
    });
  } catch (error) {
    console.error("Freelancer profile error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});
// =========================
// START SERVER
// =========================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

// Export app for tests
module.exports = app;