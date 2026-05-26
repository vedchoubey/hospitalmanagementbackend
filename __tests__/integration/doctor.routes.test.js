/**
 * INTEGRATION TEST - doctor.routes.js
 * 
 * Doctor creation ek complex flow hai:
 * 1. Department exist karna chahiye
 * 2. Email duplicate nahi hona chahiye
 * 3. User create hota hai (role: DOCTOR)
 * 4. Doctor profile create hota hai (userId reference ke saath)
 * 5. Password DB mein hash store hota hai
 * 
 * Ye sab ek hi API call mein hota hai - isiliye integration test important hai
 */

const request = require("supertest");
const app = require("../../app");
const User = require("../../models/userModel");
const Doctor = require("../../models/doctorModel");
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

// ✅ Helper - Admin login token
const getAdminToken = async () => {
  await User.create({
    name: "Admin User",
    email: "admin@hospital.com",
    password: "admin123456",
    role: "ADMIN",
  });

  const res = await request(app).post("/auth/login").send({
    email: "admin@hospital.com",
    password: "admin123456",
  });
  return res.body.token;
};

// ✅ Helper - Test department create karo
const createTestDepartment = async () => {
  return await Department.create({
    name: "Cardiology",
    description: "Heart department",
    isActive: true,
  });
};

// ============================================================
// TEST SUITE 1: POST /doctors
// ============================================================

describe("POST /doctors - Create Doctor Tests", () => {

  // ✅ TEST 1: Valid data → Doctor + User dono create ho
  test("should create doctor and user successfully", async () => {
    const adminToken = await getAdminToken();
    const dept = await createTestDepartment();

    const doctorData = {
      name: "Dr. Anjali Singh",
      email: "anjali@hospital.com",
      password: "docpassword123",
      departmentId: dept._id.toString(),
      specialization: "Cardiologist",
      qualification: "MBBS, MD",
      experienceYears: 8,
      consultationFee: 1500,
      availability: [
        { day: "Monday", startTime: "09:00", endTime: "17:00" },
      ],
    };

    const response = await request(app)
      .post("/doctors")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(doctorData)
      .expect(201);

    expect(response.body.message).toBe("Doctor created successfully");
    expect(response.body.data).toBeDefined();

    // DB mein User bana?
    const user = await User.findOne({ email: "anjali@hospital.com" });
    expect(user).not.toBeNull();
    expect(user.role).toBe("DOCTOR");
    expect(user.password).not.toBe("docpassword123"); // Hashed hona chahiye

    // DB mein Doctor profile bana?
    const doctor = await Doctor.findOne({ userId: user._id });
    expect(doctor).not.toBeNull();
    expect(doctor.specialization).toBe("Cardiologist");
    expect(doctor.experienceYears).toBe(8);
  });

  // ✅ TEST 2: Invalid departmentId → 400
  test("should return 400 when department does not exist", async () => {
    const adminToken = await getAdminToken();
    const mongoose = require("mongoose");
    const fakeDeptId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .post("/doctors")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Dr. Fake",
        email: "fake@hospital.com",
        password: "password123",
        departmentId: fakeDeptId.toString(),
        specialization: "General",
      })
      .expect(400);

    expect(response.body.message).toBe("Department not found");
  });

  // ✅ TEST 3: Duplicate doctor email → 400
  test("should return 400 when doctor email already exists", async () => {
    const adminToken = await getAdminToken();
    const dept = await createTestDepartment();

    // Pehle ek user create karo same email se
    await User.create({
      name: "Existing Doctor",
      email: "duplicate@hospital.com",
      password: "hashedpass",
      role: "DOCTOR",
    });

    const response = await request(app)
      .post("/doctors")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Dr. New",
        email: "duplicate@hospital.com", // Same email!
        password: "password123",
        departmentId: dept._id.toString(),
        specialization: "General",
      })
      .expect(400);

    expect(response.body.message).toBe("Email already in use");
  });

  // ✅ TEST 4: PATIENT → 403 Forbidden (sirf ADMIN create kar sakta)
  test("should return 403 when PATIENT tries to create doctor", async () => {
    // Patient login karo
    await User.create({
      name: "Patient User",
      email: "patient@test.com",
      password: "password123",
      role: "PATIENT",
    });

    const loginRes = await request(app).post("/auth/login").send({
      email: "patient@test.com",
      password: "password123",
    });
    const patientToken = loginRes.body.token;

    const dept = await createTestDepartment();

    await request(app)
      .post("/doctors")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        name: "Dr. Unauthorized",
        email: "unauth@hospital.com",
        password: "password123",
        departmentId: dept._id.toString(),
        specialization: "General",
      })
      .expect(403);
  });

  // ✅ TEST 5: No token → 401
  test("should return 401 when no token", async () => {
    await request(app).post("/doctors").send({}).expect(401);
  });
});

// ============================================================
// TEST SUITE 2: GET /doctors
// ============================================================

describe("GET /doctors - Get All Doctors Tests", () => {

  // ✅ TEST 1: Any logged user → doctors milne chahiye with populated data
  test("should return all doctors with user and department info", async () => {
    const adminToken = await getAdminToken();
    const dept = await createTestDepartment();

    // Doctor banao
    const doctorUser = await User.create({
      name: "Dr. Test",
      email: "drtest@hospital.com",
      password: "hashedpass",
      role: "DOCTOR",
    });

    await Doctor.create({
      userId: doctorUser._id,
      departmentId: dept._id,
      specialization: "Cardiologist",
      isAvailable: true,
    });

    const response = await request(app)
      .get("/doctors")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBeGreaterThan(0);

    // Populated data check karo (userId ke badle name aur email hona chahiye)
    const doctor = response.body.data[0];
    expect(doctor.userId.name).toBe("Dr. Test");
    expect(doctor.userId.email).toBe("drtest@hospital.com");
  });

  // ✅ TEST 2: No token → 401
  test("should return 401 without token", async () => {
    await request(app).get("/doctors").expect(401);
  });
});