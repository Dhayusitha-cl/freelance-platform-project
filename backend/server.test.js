const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

const app = require("./server");

let server;
let baseUrl;

test.before(async () => {
    server = http.createServer(app);

    await new Promise((resolve) => {
        server.listen(0, "127.0.0.1", resolve);
    });

    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
});

test("rejects password shorter than 8 characters", async () => {
    const response = await fetch(`${baseUrl}/api/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: "Test User",
            email: "shortpassword@example.com",
            password: "1234567",
            confirmPassword: "1234567",
            role: "client"
        })
    });

    const data = await response.json();

    assert.strictEqual(response.status, 400);
    assert.strictEqual(
        data.message,
        "Password must contain at least 8 characters"
    );
});

test("rejects when passwords do not match", async () => {
    const response = await fetch(`${baseUrl}/api/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: "Test User",
            email: "mismatch@example.com",
            password: "password123",
            confirmPassword: "different123",
            role: "client"
        })
    });

    const data = await response.json();

    assert.strictEqual(response.status, 400);
    assert.strictEqual(data.message, "Passwords do not match");
});

test("accepts a password with exactly 8 characters", async () => {
    const response = await fetch(`${baseUrl}/api/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: "Test User",
            email: "validpassword@example.com",
            password: "12345678",
            confirmPassword: "12345678",
            role: "client"
        })
    });

    const data = await response.json();

    assert.strictEqual(response.status, 201);
    assert.strictEqual(data.message, "Registration successful");
    assert.strictEqual(data.user.email, "validpassword@example.com");
    assert.strictEqual(data.user.password, undefined);
});