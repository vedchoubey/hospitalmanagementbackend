/**
 * INTEGRATION TEST - auth.routes.js
 * 
 * Supertest = Java ka MockMvc
 * Real HTTP request karta hai bina server start kiye
 * 
 * In-memory MongoDB use karte hain taaki real DB affect na ho
 * Har test ke baad DB clean hoti hai - isolation ke liye
 * 
 * Flow: Supertest → Routes → Controller → Service → Model → In-memory MongoDB
 */

const request = require("supertest");
const app = require("../../app");
const User = require("../../models/userModel");
const { connectTestDB, clearTestDB, closeTestDB } = require("../setup/db.setup");

// ✅ JUnit ka @BeforeAll jaisa - ek baar pehle chale
beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret_12345";
  process.env.JWT_EXPIRES_IN = "1d";
  await connectTestDB();
});

// ✅ JUnit ka @AfterEach jaisa - har test ke baad DB clean
afterEach(async () => {
  await clearTestDB();
});

// ✅ JUnit ka @AfterAll jaisa - sab tests ke baad connection close
afterAll(async () => {
  await closeTestDB();
});

// ============================================================
// TEST SUITE 1: POST /auth/register
// ============================================================

describe("POST /auth/register - Integration Tests", () => {

  // ✅ TEST 1: Successful registration
  test("should register a new user successfully", async () => {
    const newUser = {
      name: "Rahul Sharma",
      email: "rahul@test.com",
      password: "password123",
    };

    const response = await request(app)
      .post("/auth/register")
      .send(newUser)
      .expect(201); // Status 201 Created

    // Response check karo
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("User registered successfully");

    // User DB mein save hua?
    const savedUser = await User.findOne({ email: "rahul@test.com" });
    expect(savedUser).not.toBeNull();
    expect(savedUser.name).toBe("Rahul Sharma");

    // Password plain text mein save nahi hona chahiye!
    expect(savedUser.password).not.toBe("password123"); // bcrypt hash hona chahiye

    // Default role PATIENT hona chahiye
    expect(savedUser.role).toBe("PATIENT");
  });

  // ✅ TEST 2: Duplicate email → 400
  test("should return 400 when email already exists", async () => {
    // Pehle ek user create karo
    await User.create({
      name: "Existing User",
      email: "existing@test.com",
      password: "hashedpassword123",
      role: "PATIENT",
    });

    // Same email se dobara register karo
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "New User",
        email: "existing@test.com", // Same email!
        password: "password123",
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("User already exists");
  });

  // ✅ TEST 3: Missing fields → 400
  test("should return 400 when required fields are missing", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({ name: "Only Name" }) // email aur password missing
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("All fields are required");
  });

  // ✅ TEST 4: Empty body → 400
  test("should return 400 when body is empty", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});

// ============================================================
// TEST SUITE 2: POST /auth/login
// ============================================================

describe("POST /auth/login - Integration Tests", () => {

  // ✅ Har login test se pehle ek user create karo
  // (ye helper function hai - DRY principle)
  const createTestUser = async (overrides = {}) => {
    return await User.create({
      name: "Test User",
      email: "testuser@test.com",
      password: "plainpassword", // UserModel ka pre-save hook hash karega
      role: "PATIENT",
      isActive: true,
      ...overrides,
    });
  };

  // ✅ TEST 1: Successful login → token milna chahiye
  test("should login successfully with correct credentials", async () => {
    await createTestUser();

    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "testuser@test.com",
        password: "plainpassword",
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Login successful");

    // Token milna chahiye
    expect(response.body.token).toBeDefined();
    expect(typeof response.body.token).toBe("string");

    // User data return hona chahiye
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe("testuser@test.com");

    // Password response mein nahi hona chahiye (security!)
    expect(response.body.user.password).toBeUndefined();
  });

  // ✅ TEST 2: Wrong password → 401
  test("should return 401 with wrong password", async () => {
    await createTestUser();

    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "testuser@test.com",
        password: "wrongpassword", // Galat password
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid Credentials");
    expect(response.body.token).toBeUndefined(); // Token nahi milna chahiye
  });

  // ✅ TEST 3: Non-existing email → 404
  test("should return 404 when user does not exist", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "nonexistent@test.com",
        password: "somepassword",
      })
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("User not found");
  });

  // ✅ TEST 4: Deactivated account → 403
  test("should return 403 when account is deactivated", async () => {
    await createTestUser({ isActive: false }); // Deactivated user

    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "testuser@test.com",
        password: "plainpassword",
      })
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Deactivated account");
  });

  // ✅ TEST 5: Missing email/password → 400
  test("should return 400 when email or password is missing", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "test@test.com" }) // password missing
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});

// ============================================================
// TEST SUITE 3: Protected Routes (JWT Test)
// ============================================================

describe("Protected Routes - JWT Middleware Tests", () => {

  let authToken;

  // Test user banao aur token lo
  beforeEach(async () => {
    await User.create({
      name: "JWT Test User",
      email: "jwtuser@test.com",
      password: "password123",
      role: "ADMIN",
    });

    const loginRes = await request(app).post("/auth/login").send({
      email: "jwtuser@test.com",
      password: "password123",
    });
    authToken = loginRes.body.token;
  });

  // ✅ TEST 1: Valid token → access milna chahiye
  test("should allow access with valid JWT token", async () => {
    await request(app)
      .get("/auth/test")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);
  });

  // ✅ TEST 2: No token → 401
  test("should return 401 when no token provided", async () => {
    await request(app).get("/auth/test").expect(401);
  });

  // ✅ TEST 3: Invalid token → 401
  test("should return 401 with invalid token", async () => {
    await request(app)
      .get("/auth/test")
      .set("Authorization", "Bearer invalid.token.xyz")
      .expect(401);
  });

  // ✅ TEST 4: ADMIN route pe ADMIN access → 200
  test("should allow ADMIN to access admin-only route", async () => {
    await request(app)
      .get("/auth/admin-test")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);
  });

  // ✅ TEST 5: DOCTOR route pe ADMIN aaye → 403
  test("should return 403 when ADMIN tries DOCTOR-only route", async () => {
    await request(app)
      .get("/auth/doctor-test")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(403);
  });
});