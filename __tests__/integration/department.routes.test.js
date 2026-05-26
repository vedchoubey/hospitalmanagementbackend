/**
 * INTEGRATION TEST - department.routes.js
 * 
 * Department routes test:
 * POST /departments → Sirf ADMIN
 * GET  /departments → Any logged in user
 * 
 * Yahan hum pura flow test karte hain:
 * HTTP Request → Route → Auth Middleware → Role Middleware → Controller → Service → DB
 */

const request = require("supertest");
const app = require("../../app");
const User = require("../../models/userModel");
const Department = require("../../models/departmentModel");
const { connectTestDB, clearTestDB, closeTestDB } = require("../setup/db.setup");

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret_12345";
  process.env.JWT_EXPIRES_IN = "1d";
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

// ✅ Helper - Login karke token lo (DRY principle)
const loginAndGetToken = async (role = "ADMIN") => {
  const emailMap = {
    ADMIN: "admin@test.com",
    PATIENT: "patient@test.com",
    DOCTOR: "doctor@test.com",
  };

  const email = emailMap[role];

  await User.create({
    name: `Test ${role}`,
    email,
    password: "password123",
    role,
    isActive: true,
  });

  const loginRes = await request(app).post("/auth/login").send({
    email,
    password: "password123",
  });

  return loginRes.body.token;
};

// ============================================================
// TEST SUITE 1: POST /departments
// ============================================================

describe("POST /departments - Create Department Tests", () => {

  // ✅ TEST 1: ADMIN → 201 Created
  test("should create department when ADMIN is logged in", async () => {
    const adminToken = await loginAndGetToken("ADMIN");

    const deptData = {
      name: "Cardiology",
      description: "Heart related treatments",
      image: "cardiology.jpg",
    };

    const response = await request(app)
      .post("/departments")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(deptData)
      .expect(201);

    // Response check
    expect(response.body.data).toBeDefined();
    expect(response.body.data.name).toBe("Cardiology");

    // DB mein actual save hua?
    const savedDept = await Department.findOne({ name: "Cardiology" });
    expect(savedDept).not.toBeNull();
    expect(savedDept.isActive).toBe(true); // default true hona chahiye
  });

  // ✅ TEST 2: PATIENT → 403 Forbidden
  test("should return 403 when PATIENT tries to create department", async () => {
    const patientToken = await loginAndGetToken("PATIENT");

    const response = await request(app)
      .post("/departments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ name: "Neurology" })
      .expect(403);

    expect(response.body.message).toContain("Access denied");

    // DB mein save nahi hona chahiye
    const dept = await Department.findOne({ name: "Neurology" });
    expect(dept).toBeNull();
  });

  // ✅ TEST 3: No token → 401
  test("should return 401 when no token provided", async () => {
    await request(app)
      .post("/departments")
      .send({ name: "Orthopedics" })
      .expect(401);
  });
});

// ============================================================
// TEST SUITE 2: GET /departments
// ============================================================

describe("GET /departments - Get All Departments Tests", () => {

  // ✅ TEST 1: Logged in user → departments milni chahiye
  test("should return all active departments for logged in user", async () => {
    const patientToken = await loginAndGetToken("PATIENT");

    // Test data create karo
    await Department.create([
      { name: "Cardiology", isActive: true },
      { name: "Orthopedics", isActive: true },
      { name: "Old Dept", isActive: false }, // inactive - nahi milni chahiye
    ]);

    const response = await request(app)
      .get("/departments")
      .set("Authorization", `Bearer ${patientToken}`)
      .expect(200);

    // Sirf active departments milni chahiye (2, inactive wali nahi)
    expect(response.body.length).toBe(2);

    const names = response.body.map((d) => d.name);
    expect(names).toContain("Cardiology");
    expect(names).toContain("Orthopedics");
    expect(names).not.toContain("Old Dept");
  });

  // ✅ TEST 2: No token → 401
  test("should return 401 when accessing without token", async () => {
    await request(app).get("/departments").expect(401);
  });

  // ✅ TEST 3: Empty DB → empty array
  test("should return empty array when no departments exist", async () => {
    const patientToken = await loginAndGetToken("PATIENT");

    const response = await request(app)
      .get("/departments")
      .set("Authorization", `Bearer ${patientToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
});