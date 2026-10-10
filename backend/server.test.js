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
     

// =========================
// T18 FREELANCER PROFILE API TESTS
// =========================

test("returns a freelancer profile successfully", async () => {
  const email = `profile-${Date.now()}@example.com`;

  const registerResponse = await request(app)
    .post("/api/register")
    .send({
      name: "Profile Freelancer",
      email,
      password: "password123",
      confirmPassword: "password123",
      role: "freelancer"
    });

  assert.strictEqual(registerResponse.status, 201);

  const freelancerId = registerResponse.body.user.id;

  const response = await request(app)
    .get(`/api/freelancers/${freelancerId}`);

  assert.strictEqual(response.status, 200);
  assert.ok(response.body.freelancer);

  assert.strictEqual(
    response.body.freelancer.id,
    freelancerId
  );

  assert.strictEqual(
    response.body.freelancer.name,
    "Profile Freelancer"
  );

  assert.strictEqual(
    response.body.freelancer.email,
    email
  );

  assert.strictEqual(
    response.body.freelancer.role,
    "freelancer"
  );

  assert.strictEqual(
    response.body.freelancer.password,
    undefined
  );
});

test("rejects freelancer profile request with invalid ID", async () => {
  const response = await request(app)
    .get("/api/freelancers/-1");

  assert.strictEqual(response.status, 400);

  assert.strictEqual(
    response.body.message,
    "Freelancer ID must be a positive integer"
  );
});

test("returns 404 when freelancer does not exist", async () => {
  const response = await request(app)
    .get("/api/freelancers/99999");

  assert.strictEqual(response.status, 404);

  assert.strictEqual(
    response.body.message,
    "Freelancer not found"
  );
});

test("does not return a client as a freelancer", async () => {
  const email = `client-profile-${Date.now()}@example.com`;

  const registerResponse = await request(app)
    .post("/api/register")
    .send({
      name: "Profile Client",
      email,
      password: "password123",
      confirmPassword: "password123",
      role: "client"
    });

  assert.strictEqual(registerResponse.status, 201);

  const clientId = registerResponse.body.user.id;

  const response = await request(app)
    .get(`/api/freelancers/${clientId}`);

  assert.strictEqual(response.status, 404);

  assert.strictEqual(
    response.body.message,
    "Freelancer not found"
  );
});

test("accepting a proposal creates a notification for the freelancer", async () => {
  const email = `notification-${Date.now()}@example.com`;

  const registerResponse = await request(app)
    .post("/api/register")
    .send({
      name: "Notification Freelancer",
      email,
      password: "password123",
      confirmPassword: "password123",
      role: "freelancer"
    });

  assert.strictEqual(registerResponse.status, 201);

  const freelancerId = registerResponse.body.user.id;

  const jobResponse = await request(app)
    .post("/api/jobs")
    .send({
      title: "Notification Test Job",
      description: "Testing proposal acceptance notifications",
      budget: 1500,
      deadline: "2026-12-30",
      category: "web-development",
      skills: "JavaScript"
    });

  assert.strictEqual(jobResponse.status, 201);

  const jobId = jobResponse.body.job.id;

  const proposalResponse = await request(app)
    .post("/api/proposals")
    .send({
      jobId,
      freelancerId,
      coverLetter: "I can complete this project.",
      bidAmount: 1200
    });

  assert.strictEqual(proposalResponse.status, 201);

  const proposalId = proposalResponse.body.proposal.id;

  const acceptResponse = await request(app)
    .post(`/api/proposals/${proposalId}/accept`);

  assert.strictEqual(acceptResponse.status, 200);
  assert.strictEqual(
    acceptResponse.body.proposal.status,
    "accepted"
  );
  assert.strictEqual(
    acceptResponse.body.notification.userId,
    freelancerId
  );
  assert.strictEqual(
    acceptResponse.body.notification.type,
    "proposal_accepted"
  );

  const notificationResponse = await request(app)
    .get(`/api/notifications/${freelancerId}`);

  assert.strictEqual(notificationResponse.status, 200);
  assert.strictEqual(
    notificationResponse.body.notifications.length,
    1
  );
  assert.strictEqual(
    notificationResponse.body.notifications[0].proposalId,
    proposalId
  );
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


test("rejects acceptance with an invalid proposal ID", async () => {
  const response = await request(app)
    .post("/api/proposals/-1/accept");

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Invalid proposal ID"
  );
});

test("rejects acceptance when proposal does not exist", async () => {
  const response = await request(app)
    .post("/api/proposals/999999/accept");

  assert.strictEqual(response.status, 404);
  assert.strictEqual(
    response.body.message,
    "Proposal not found"
  );
});

test("rejects accepting the same proposal twice", async () => {
  // 1. Register a freelancer
  const email = `repeat-accept-${Date.now()}@example.com`;

  const registerResponse = await request(app)
    .post("/api/register")
    .send({
      name: "Acceptance Test Freelancer",
      email,
      password: "password123",
      confirmPassword: "password123",
      role: "freelancer"
    });

  assert.strictEqual(registerResponse.status, 201);

  const freelancerId = registerResponse.body.user.id;

  // 2. Create a job
  const jobResponse = await request(app)
    .post("/api/jobs")
    .send({
      title: "Repeated Acceptance Test",
      description: "Testing repeated proposal acceptance",
      budget: 1500,
      deadline: "2026-12-30",
      category: "web-development",
      skills: "JavaScript"
    });

  assert.strictEqual(jobResponse.status, 201);

  const jobId = jobResponse.body.job.id;

  // 3. Submit a proposal
  const proposalResponse = await request(app)
    .post("/api/proposals")
    .send({
      jobId,
      freelancerId,
      coverLetter: "I can complete this project.",
      bidAmount: 1200
    });

  assert.strictEqual(proposalResponse.status, 201);

  const proposalId = proposalResponse.body.proposal.id;

  // 4. Accept the proposal for the first time
  const firstAcceptance = await request(app)
    .post(`/api/proposals/${proposalId}/accept`);

  assert.strictEqual(firstAcceptance.status, 200);
  assert.strictEqual(
    firstAcceptance.body.proposal.status,
    "accepted"
  );

  // 5. Attempt to accept the same proposal again
  const secondAcceptance = await request(app)
    .post(`/api/proposals/${proposalId}/accept`);

  assert.strictEqual(secondAcceptance.status, 409);
  assert.strictEqual(
    secondAcceptance.body.message,
    "Proposal already accepted"
  );
});

 // =========================
// MILESTONE API TESTS
// =========================

test("creates a milestone for an existing job", async () => {
  const jobTitle = `Milestone Test Job ${Date.now()}`;

  const jobResponse = await request(app)
    .post("/api/jobs")
    .send({
      title: jobTitle,
      description: "A job created for milestone testing",
      budget: 1000,
      deadline: "2026-12-30",
      category: "web-development",
      skills: "JavaScript"
    });

  assert.strictEqual(jobResponse.status, 201);

  const response = await request(app)
    .post("/api/milestones")
    .send({
      jobTitle,
      title: "Homepage design",
      description: "Complete the homepage layout",
      dueDate: "2026-12-15",
      amount: 250
    });

  assert.strictEqual(response.status, 201);
  assert.strictEqual(
    response.body.message,
    "Milestone created successfully"
  );
  assert.ok(response.body.milestone.id);
  assert.strictEqual(
    response.body.milestone.jobId,
    jobResponse.body.job.id
  );
  assert.strictEqual(
    response.body.milestone.title,
    "Homepage design"
  );
  assert.strictEqual(response.body.milestone.amount, 250);
});

test("rejects milestone creation when required fields are missing", async () => {
  const response = await request(app)
    .post("/api/milestones")
    .send({
      title: "Homepage design"
    });

  assert.strictEqual(response.status, 400);
});

test("rejects milestone creation with a negative amount", async () => {
  const jobTitle = `Negative Amount Job ${Date.now()}`;

  const jobResponse = await request(app)
    .post("/api/jobs")
    .send({
      title: jobTitle,
      description: "A job for amount validation",
      budget: 1000,
      deadline: "2026-12-30",
      category: "web-development",
      skills: "JavaScript"
    });

  assert.strictEqual(jobResponse.status, 201);

  const response = await request(app)
    .post("/api/milestones")
    .send({
      jobTitle,
      title: "Homepage design",
      description: "Complete the homepage layout",
      dueDate: "2026-12-15",
      amount: -10
    });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Amount must be a non-negative number"
  );
});

test("rejects milestone creation with a past due date", async () => {
  const jobTitle = `Past Due Date Job ${Date.now()}`;

  const futureJobDeadline = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString().slice(0, 10);

  const pastDueDate = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString().slice(0, 10);

  const jobResponse = await request(app)
    .post("/api/jobs")
    .send({
      title: jobTitle,
      description: "A job for past due date testing",
      budget: 1000,
      deadline: futureJobDeadline,
      category: "web-development",
      skills: "JavaScript"
    });

  assert.strictEqual(jobResponse.status, 201);

  const response = await request(app)
    .post("/api/milestones")
    .send({
      jobTitle,
      title: "Past Due Milestone",
      description: "Testing past due date rejection",
      dueDate: pastDueDate,
      amount: 250
    });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Due date must be in the future"
  );
});
test("rejects milestone creation with an invalid date", async () => {
  const jobTitle = `Invalid Date Job ${Date.now()}`;

  const jobResponse = await request(app)
    .post("/api/jobs")
    .send({
      title: jobTitle,
      description: "A job for date validation",
      budget: 1000,
      deadline: "2026-12-30",
      category: "web-development",
      skills: "JavaScript"
    });

  assert.strictEqual(jobResponse.status, 201);

  const response = await request(app)
    .post("/api/milestones")
    .send({
      jobTitle,
      title: "Homepage design",
      description: "Complete the homepage layout",
      dueDate: "2026-02-30",
      amount: 250
    });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(
    response.body.message,
    "Due date must be a valid date"
  );
});

test("returns 404 when milestone job title does not exist", async () => {
  const response = await request(app)
    .post("/api/milestones")
    .send({
      jobTitle: `Missing Job ${Date.now()}`,
      title: "Homepage design",
      description: "Complete the homepage layout",
      dueDate: "2026-12-15",
      amount: 250
    });

  assert.strictEqual(response.status, 404);
  assert.strictEqual(response.body.message, "Job not found");
});
