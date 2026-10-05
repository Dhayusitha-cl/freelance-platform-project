const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("./server");

// =========================
// REGISTRATION TESTS
// =========================

test("rejects password shorter than 8 characters", async () => {
  const response = await request(app)
    .post("/api/register")
    .send({
      name: "Test User",
      email: `short-${Date.now()}@example.com`,
      password: "1234567",
      confirmPassword: "1234567",
      role: "freelancer"
    });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Password must contain at least 8 characters"
  );
});

test("rejects when passwords do not match", async () => {
  const response = await request(app)
    .post("/api/register")
    .send({
      name: "Test User",
      email: `mismatch-${Date.now()}@example.com`,
      password: "password123",
      confirmPassword: "different123",
      role: "freelancer"
    });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Passwords do not match"
  );
});

test("rejects invalid email", async () => {
  const response = await request(app)
    .post("/api/register")
    .send({
      name: "Test User",
      email: "invalid-email",
      password: "password123",
      confirmPassword: "password123",
      role: "freelancer"
    });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Please provide a valid email address"
  );
});

test("rejects invalid role", async () => {
  const response = await request(app)
    .post("/api/register")
    .send({
      name: "Test User",
      email: `role-${Date.now()}@example.com`,
      password: "password123",
      confirmPassword: "password123",
      role: "admin"
    });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Role must be either client or freelancer"
  );
});

test("registers a freelancer successfully", async () => {
  const response = await request(app)
    .post("/api/register")
    .send({
      name: "Test Freelancer",
      email: `freelancer-${Date.now()}@example.com`,
      password: "password123",
      confirmPassword: "password123",
      role: "freelancer"
    });

  assert.strictEqual(response.status, 201);
  assert.strictEqual(
    response.body.message,
    "Registration successful"
  );
  assert.strictEqual(response.body.user.role, "freelancer");
  assert.ok(response.body.user.id);
});

// =========================
// LOGIN TESTS
// =========================

test("rejects login when fields are missing", async () => {
  const response = await request(app)
    .post("/api/login")
    .send({
      email: ""
    });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Email and password are required"
  );
});

test("rejects login with unknown email", async () => {
  const response = await request(app)
    .post("/api/login")
    .send({
      email: `unknown-${Date.now()}@example.com`,
      password: "password123"
    });

  assert.strictEqual(response.status, 401);
  assert.strictEqual(
    response.body.message,
    "Invalid email or password"
  );
});

test("login returns JWT for valid credentials", async () => {
  const email = `login-${Date.now()}@example.com`;

  await request(app)
    .post("/api/register")
    .send({
      name: "Login Freelancer",
      email,
      password: "password123",
      confirmPassword: "password123",
      role: "freelancer"
    });

  const response = await request(app)
    .post("/api/login")
    .send({
      email,
      password: "password123"
    });

  assert.strictEqual(response.status, 200);
  assert.strictEqual(
    response.body.message,
    "Login successful"
  );
  assert.ok(response.body.token);
  assert.strictEqual(response.body.user.email, email);
  assert.strictEqual(response.body.user.role, "freelancer");
});

// =========================
// JOB TESTS
// =========================

test("rejects job with invalid budget", async () => {
  const response = await request(app)
    .post("/api/jobs")
    .send({
      title: "Invalid Budget Job",
      description: "Testing invalid budget",
      budget: -500,
      deadline: "2026-12-20",
      category: "web-development",
      skills: "JavaScript"
    });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Budget must be a positive number"
  );
});

test("rejects job with invalid deadline", async () => {
  const response = await request(app)
    .post("/api/jobs")
    .send({
      title: "Invalid Deadline Job",
      description: "Testing invalid deadline",
      budget: 500,
      deadline: "invalid-date",
      category: "web-development",
      skills: "JavaScript"
    });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Deadline must be a valid date"
  );
});

test("rejects job with past deadline", async () => {
  const response = await request(app)
    .post("/api/jobs")
    .send({
      title: "Past Deadline Job",
      description: "Testing past deadline",
      budget: 500,
      deadline: "2020-01-01",
      category: "web-development",
      skills: "JavaScript"
    });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Deadline must be a future date"
  );
});

test("creates a job successfully", async () => {
  const response = await request(app)
    .post("/api/jobs")
    .send({
      title: "Build a Website",
      description: "Need a website built",
      budget: 1000,
      deadline: "2026-12-20",
      category: "web-development",
      skills: "HTML, CSS, JavaScript"
    });

  assert.strictEqual(response.status, 201);
  assert.strictEqual(
    response.body.message,
    "Job created successfully"
  );
  assert.ok(response.body.job.id);
  assert.strictEqual(
    response.body.job.title,
    "Build a Website"
  );
});

// =========================
// T15 BID VALIDATION TESTS
// =========================

test("rejects proposal when required fields are missing", async () => {
  const response = await request(app)
    .post("/api/proposals")
    .send({});

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Job ID, freelancer ID, cover letter, and bid amount are required"
  );
});

test("rejects proposal with invalid job ID", async () => {
  const response = await request(app)
    .post("/api/proposals")
    .send({
      jobId: -1,
      freelancerId: 1,
      coverLetter: "I can complete this project.",
      bidAmount: 500
    });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Job ID must be a positive integer"
  );
});

test("rejects proposal with invalid freelancer ID", async () => {
  const response = await request(app)
    .post("/api/proposals")
    .send({
      jobId: 1,
      freelancerId: -1,
      coverLetter: "I can complete this project.",
      bidAmount: 500
    });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Freelancer ID must be a positive integer"
  );
});

test("rejects proposal with empty cover letter", async () => {
  const response = await request(app)
    .post("/api/proposals")
    .send({
      jobId: 1,
      freelancerId: 1,
      coverLetter: "   ",
      bidAmount: 500
    });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Cover letter is required"
  );
});

test("rejects proposal with invalid bid amount", async () => {
  const response = await request(app)
    .post("/api/proposals")
    .send({
      jobId: 1,
      freelancerId: 1,
      coverLetter: "I can complete this project.",
      bidAmount: -100
    });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Bid amount must be a positive number"
  );
});

test("rejects proposal when job does not exist", async () => {
  const response = await request(app)
    .post("/api/proposals")
    .send({
      jobId: 99999,
      freelancerId: 1,
      coverLetter: "I can complete this project.",
      bidAmount: 500
    });

  assert.strictEqual(response.status, 404);
  assert.strictEqual(
    response.body.message,
    "Job not found"
  );
});

test("rejects proposal when freelancer does not exist", async () => {
  const jobResponse = await request(app)
    .post("/api/jobs")
    .send({
      title: "Proposal Test Job",
      description: "Job for proposal validation",
      budget: 1000,
      deadline: "2026-12-25",
      category: "web-development",
      skills: "JavaScript"
    });

  const jobId = jobResponse.body.job.id;

  const response = await request(app)
    .post("/api/proposals")
    .send({
      jobId,
      freelancerId: 99999,
      coverLetter: "I can complete this project.",
      bidAmount: 500
    });

  assert.strictEqual(response.status, 404);
  assert.strictEqual(
    response.body.message,
    "Freelancer not found"
  );
});

test("accepts a valid proposal", async () => {
  const email = `proposal-${Date.now()}@example.com`;

  const registerResponse = await request(app)
    .post("/api/register")
    .send({
      name: "Proposal Freelancer",
      email,
      password: "password123",
      confirmPassword: "password123",
      role: "freelancer"
    });

  const freelancerId = registerResponse.body.user.id;

  const jobResponse = await request(app)
    .post("/api/jobs")
    .send({
      title: "Valid Proposal Job",
      description: "Testing valid proposal",
      budget: 1500,
      deadline: "2026-12-30",
      category: "web-development",
      skills: "Node.js"
    });

  const jobId = jobResponse.body.job.id;

  const response = await request(app)
    .post("/api/proposals")
    .send({
      jobId,
      freelancerId,
      coverLetter: "I have the required experience for this project.",
      bidAmount: 1200
    });

  assert.strictEqual(response.status, 201);
  assert.strictEqual(
    response.body.message,
    "Proposal submitted successfully"
  );
  assert.ok(response.body.proposal.id);
  assert.strictEqual(
    response.body.proposal.jobId,
    jobId
  );
  assert.strictEqual(
    response.body.proposal.freelancerId,
    freelancerId
  );
  assert.strictEqual(
    response.body.proposal.bidAmount,
    1200
  );
});

test("rejects duplicate proposal from the same freelancer", async () => {
  const email = `duplicate-${Date.now()}@example.com`;

  const registerResponse = await request(app)
    .post("/api/register")
    .send({
      name: "Duplicate Freelancer",
      email,
      password: "password123",
      confirmPassword: "password123",
      role: "freelancer"
    });

  const freelancerId = registerResponse.body.user.id;

  const jobResponse = await request(app)
    .post("/api/jobs")
    .send({
      title: "Duplicate Proposal Job",
      description: "Testing duplicate proposals",
      budget: 1000,
      deadline: "2026-12-28",
      category: "design",
      skills: "Figma"
    });

  const jobId = jobResponse.body.job.id;

  const firstResponse = await request(app)
    .post("/api/proposals")
    .send({
      jobId,
      freelancerId,
      coverLetter: "First proposal.",
      bidAmount: 900
    });

  assert.strictEqual(firstResponse.status, 201);

  const secondResponse = await request(app)
    .post("/api/proposals")
    .send({
      jobId,
      freelancerId,
      coverLetter: "Second proposal.",
      bidAmount: 800
    });

  assert.strictEqual(secondResponse.status, 409);
  assert.strictEqual(
    secondResponse.body.message,
    "Freelancer has already submitted a proposal for this job"
  );
});

test("completes the full freelancer bidding flow", async () => {
  const freelancerEmail = "flow.freelancer@example.com";
  const clientEmail = "flow.client@example.com";

  // 1. Register freelancer
  const freelancerRegister = await request(app)
    .post("/api/register")
    .send({
      name: "Flow Freelancer",
      email: freelancerEmail,
      password: "Password123",
      confirmPassword: "Password123",
      role: "freelancer"
    });

  assert.strictEqual(freelancerRegister.statusCode, 201);
  assert.strictEqual(
    freelancerRegister.body.user.email,
    freelancerEmail
  );
  assert.strictEqual(
    freelancerRegister.body.user.role,
    "freelancer"
  );

  const freelancerId = freelancerRegister.body.user.id;

  // 2. Register client
  const clientRegister = await request(app)
    .post("/api/register")
    .send({
      name: "Flow Client",
      email: clientEmail,
      password: "Password123",
      confirmPassword: "Password123",
      role: "client"
    });

  assert.strictEqual(clientRegister.statusCode, 201);
  assert.strictEqual(
    clientRegister.body.user.email,
    clientEmail
  );
  assert.strictEqual(
    clientRegister.body.user.role,
    "client"
  );

  // 3. Login as client
  const clientLogin = await request(app)
    .post("/api/login")
    .send({
      email: clientEmail,
      password: "Password123"
    });

  assert.strictEqual(clientLogin.statusCode, 200);
  assert.ok(clientLogin.body.token);
  assert.strictEqual(
    clientLogin.body.user.role,
    "client"
  );

  // 4. Client creates a job
  const jobResponse = await request(app)
    .post("/api/jobs")
    .send({
      title: "Full Flow Test Job",
      description: "Testing the complete freelancer bidding flow.",
      budget: 1000,
      deadline: "2099-12-31",
      category: "web-development",
      skills: "HTML, CSS, JavaScript"
    });

  assert.strictEqual(jobResponse.statusCode, 201);
  assert.strictEqual(
    jobResponse.body.message,
    "Job created successfully"
  );
  assert.ok(jobResponse.body.job);

  const jobId = jobResponse.body.job.id;

  // 5. Freelancer logs in
  const freelancerLogin = await request(app)
    .post("/api/login")
    .send({
      email: freelancerEmail,
      password: "Password123"
    });

  assert.strictEqual(freelancerLogin.statusCode, 200);
  assert.ok(freelancerLogin.body.token);
  assert.strictEqual(
    freelancerLogin.body.user.role,
    "freelancer"
  );

  // 6. Freelancer submits a proposal
  const proposalResponse = await request(app)
    .post("/api/proposals")
    .send({
      jobId,
      freelancerId,
      coverLetter: "I can complete this project successfully.",
      bidAmount: 900
    });

  assert.strictEqual(proposalResponse.statusCode, 201);
  assert.strictEqual(
    proposalResponse.body.message,
    "Proposal submitted successfully"
  );
  assert.ok(proposalResponse.body.proposal);
  assert.strictEqual(
    proposalResponse.body.proposal.jobId,
    jobId
  );
  assert.strictEqual(
    proposalResponse.body.proposal.freelancerId,
    freelancerId
  );
  assert.strictEqual(
    proposalResponse.body.proposal.bidAmount,
    900
  );
});
