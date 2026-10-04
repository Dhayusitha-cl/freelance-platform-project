const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("./server");

const testEmail = `login-test-${Date.now()}@example.com`;
const testPassword = "Password123";

test("POST /api/login should return JWT for valid credentials", async () => {
  // Register a user first
  const registerResponse = await request(app)
    .post("/api/register")
    .send({
      name: "Login Test User",
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      role: "freelancer"
    });

  assert.strictEqual(registerResponse.statusCode, 201);

  // Login using the registered credentials
  const loginResponse = await request(app)
    .post("/api/login")
    .send({
      email: testEmail,
      password: testPassword
    });

  assert.strictEqual(loginResponse.statusCode, 200);
  assert.strictEqual(loginResponse.body.message, "Login successful");

  assert.ok(loginResponse.body.token);
  assert.strictEqual(typeof loginResponse.body.token, "string");

  assert.strictEqual(
    loginResponse.body.user.email,
    testEmail
  );

  assert.strictEqual(
    loginResponse.body.user.role,
    "freelancer"
  );
});

test("POST /api/login should reject incorrect password", async () => {
  const email = `wrong-password-${Date.now()}@example.com`;

  await request(app)
    .post("/api/register")
    .send({
      name: "Wrong Password User",
      email,
      password: testPassword,
      confirmPassword: testPassword,
      role: "client"
    });

  const loginResponse = await request(app)
    .post("/api/login")
    .send({
      email,
      password: "WrongPassword123"
    });

  assert.strictEqual(loginResponse.statusCode, 401);

  assert.strictEqual(
    loginResponse.body.message,
    "Invalid email or password"
  );
});

test("POST /api/login should reject unknown email", async () => {
  const loginResponse = await request(app)
    .post("/api/login")
    .send({
      email: "does-not-exist@example.com",
      password: "Password123"
    });

  assert.strictEqual(loginResponse.statusCode, 401);

  assert.strictEqual(
    loginResponse.body.message,
    "Invalid email or password"
  );
});

test("POST /api/login should reject missing fields", async () => {
  const loginResponse = await request(app)
    .post("/api/login")
    .send({
      email: "test@example.com"
    });

  assert.strictEqual(loginResponse.statusCode, 400);

  assert.strictEqual(
    loginResponse.body.message,
    "Email and password are required"
  );
});