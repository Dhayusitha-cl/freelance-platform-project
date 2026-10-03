const { describe, test } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const app = require("./server");

describe("T-4 Registration Flow", () => {
    test("successfully registers a new freelancer", async () => {
        const response = await request(app)
            .post("/api/register")
            .send({
                name: "Flow Test User",
                email: "flowtest@example.com",
                password: "password123",
                confirmPassword: "password123",
                role: "freelancer"
            });

        assert.strictEqual(response.statusCode, 201);
        assert.strictEqual(
            response.body.message,
            "Registration successful"
        );
        assert.strictEqual(
            response.body.user.email,
            "flowtest@example.com"
        );
        assert.strictEqual(
            response.body.user.role,
            "freelancer"
        );
        assert.strictEqual(response.body.user.password, undefined);
    });

    test("rejects registration when required fields are missing", async () => {
        const response = await request(app)
            .post("/api/register")
            .send({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: ""
            });

        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(
            response.body.message,
            "All fields are required"
        );
    });

    test("rejects registration with an invalid email", async () => {
        const response = await request(app)
            .post("/api/register")
            .send({
                name: "Email Test User",
                email: "invalid-email",
                password: "password123",
                confirmPassword: "password123",
                role: "client"
            });

        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(
            response.body.message,
            "Please provide a valid email address"
        );
    });

    test("rejects registration with an invalid role", async () => {
        const response = await request(app)
            .post("/api/register")
            .send({
                name: "Role Test User",
                email: "roletest@example.com",
                password: "password123",
                confirmPassword: "password123",
                role: "admin"
            });

        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(
            response.body.message,
            "Role must be either client or freelancer"
        );
    });

    test("rejects duplicate email registration", async () => {
        const user = {
            name: "Duplicate Test User",
            email: "duplicate@example.com",
            password: "password123",
            confirmPassword: "password123",
            role: "client"
        };

        const firstResponse = await request(app)
            .post("/api/register")
            .send(user);

        assert.strictEqual(firstResponse.statusCode, 201);

        const secondResponse = await request(app)
            .post("/api/register")
            .send(user);

        assert.strictEqual(secondResponse.statusCode, 409);
        assert.strictEqual(
            secondResponse.body.message,
            "Email is already registered"
        );
    });
});