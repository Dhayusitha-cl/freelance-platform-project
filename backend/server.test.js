const test = require("node:test");
const assert = require("node:assert");
const bcrypt = require("bcryptjs");

const {
  app,
  users,
  jobs,
  proposals
} = require("./server");

const PORT = 3001;

let server;

test.before(async () => {
  server = app.listen(PORT);
});

test.after(async () => {
  server.close();
});

test.beforeEach(() => {
  users.length = 0;
  jobs.length = 0;
  proposals.length = 0;
});

// Registration tests

test("rejects password shorter than 8 characters", async () => {
  const response = await fetch(`http://localhost:${PORT}/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "Test User",
      email: "short@example.com",
      password: "1234567",
      confirmPassword: "1234567",
      role: "freelancer"
    })
  });

  assert.strictEqual(response.status, 400);

  const data = await response.json();

  assert.strictEqual(
    data.message,
    "Password must be at least 8 characters long"
  );
});

test("rejects when passwords do not match", async () => {
  const response = await fetch(`http://localhost:${PORT}/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "Test User",
      email: "mismatch@example.com",
      password: "password123",
      confirmPassword: "password456",
      role: "freelancer"
    })
  });

  assert.strictEqual(response.status, 400);

  const data = await response.json();

  assert.strictEqual(
    data.message,
    "Passwords do not match"
  );
});

// Login tests

test("logs in with valid credentials", async () => {
  const hashedPassword = await bcrypt.hash("password123", 10);

  users.push({
    id: 1,
    name: "Test User",
    email: "login@example.com",
    password: hashedPassword,
    role: "freelancer"
  });

  const response = await fetch(`http://localhost:${PORT}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: "login@example.com",
      password: "password123"
    })
  });

  assert.strictEqual(response.status, 200);

  const data = await response.json();

  assert.strictEqual(data.message, "Login successful");
  assert.ok(data.token);
  assert.strictEqual(data.user.email, "login@example.com");
});

test("rejects invalid login credentials", async () => {
  const hashedPassword = await bcrypt.hash("password123", 10);

  users.push({
    id: 1,
    name: "Test User",
    email: "invalid@example.com",
    password: hashedPassword,
    role: "freelancer"
  });

  const response = await fetch(`http://localhost:${PORT}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: "invalid@example.com",
      password: "wrongpassword"
    })
  });

  assert.strictEqual(response.status, 401);

  const data = await response.json();

  assert.strictEqual(
    data.message,
    "Invalid email or password"
  );
});

// Job tests

test("creates a job successfully", async () => {
  const response = await fetch(`http://localhost:${PORT}/api/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Build a website",
      description: "Need a responsive website",
      budget: 1000,
      deadline: "2026-10-20",
      category: "Web Development",
      skills: "HTML, CSS, JavaScript"
    })
  });

  assert.strictEqual(response.status, 201);

  const data = await response.json();

  assert.strictEqual(
    data.message,
    "Job created successfully"
  );

  assert.strictEqual(data.job.id, 1);
  assert.strictEqual(data.job.title, "Build a website");
});

// T14 Proposal Submission API tests

test("submits a proposal successfully", async () => {
  jobs.push({
    id: 1,
    title: "Build a website",
    description: "Need a responsive website",
    budget: 1000,
    deadline: "2026-10-20",
    category: "Web Development",
    skills: "HTML, CSS, JavaScript"
  });

  const response = await fetch(`http://localhost:${PORT}/api/proposals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jobId: 1,
      freelancerId: 2,
      coverLetter: "I can build this website for you.",
      bidAmount: 800
    })
  });

  assert.strictEqual(response.status, 201);

  const data = await response.json();

  assert.strictEqual(
    data.message,
    "Proposal submitted successfully"
  );

  assert.strictEqual(data.proposal.id, 1);
  assert.strictEqual(data.proposal.jobId, 1);
  assert.strictEqual(data.proposal.freelancerId, 2);
  assert.strictEqual(
    data.proposal.coverLetter,
    "I can build this website for you."
  );
  assert.strictEqual(data.proposal.bidAmount, 800);

  assert.strictEqual(proposals.length, 1);
});

test("rejects proposal for nonexistent job", async () => {
  const response = await fetch(`http://localhost:${PORT}/api/proposals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jobId: 999,
      freelancerId: 2,
      coverLetter: "I would like to work on this project.",
      bidAmount: 500
    })
  });

  assert.strictEqual(response.status, 404);

  const data = await response.json();

  assert.strictEqual(
    data.message,
    "Job not found"
  );
});

test("rejects proposal when required fields are missing", async () => {
  const response = await fetch(`http://localhost:${PORT}/api/proposals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jobId: 1,
      freelancerId: 2
    })
  });

  assert.strictEqual(response.status, 400);

  const data = await response.json();

  assert.strictEqual(
    data.message,
    "Job ID, freelancer ID, cover letter, and bid amount are required"
  );
});