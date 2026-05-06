const jwt = require("jsonwebtoken");
const generateToken = require("../../utils/generateToken");

beforeAll(
    () => {
        process.env.JWT_SECRET = "test_secret_key_12345";
        process.env.JWT_EXPIRES_IN = "1d";
    }
)
describe("generateToken - Unit Tests", () => {

    // TEST 1.  Token should generate--

    test("should generate a valid jwt token", () => {

        const mockUser = {
            _id: "507f1f77bcf86cd799439011",
            role: "PATIENT",
            email: "patient@test.com",
        }
        const token = generateToken(mockUser);

        // Token should be string 

        expect(typeof token).toBe("string");

        //Three parts in token(header.payload.signature)

        expect(token.split(".").length).toBe(3);

    })

    // Test 2 ..  There should be correct data inside the token  --

    test("should include userId,role,email in the token payload", () => {
        const mockUser = {
            _id: "507f1f77bcf86cd799439011",
            role: "DOCTOR",
            email: "doctor@test.com",
        };
        const token = generateToken(mockUser)

        //Decode token and check payload

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        expect(decoded.userId).toBe("507f1f77bcf86cd799439011");
        expect(decoded.role).toBe("DOCTOR");
        expect(decoded.email).toBe("doctor@test.com");

    });

    // Test 3. --  For different roles there is different tokens -

    test("should generate different tokens for different users", () => {
        const user1 = { _id: "111", role: "ADMIN", email: "admin@test.com" };
        const user2 = { _id: "222", role: "PATIENT", email: "patient@test.com" };

        const token1 = generateToken(user1);
        const token2 = generateToken(user2);

        expect(token1).not.toBe(token2);
    })

    // Test 4 .. verify should fail from wrong secret

    test("should fail verification from wrong secret", () => {
        const mockUser = {
            _id: "507f1f77bcf86cd799439011",
            role: "PATIENT",
            email: "patient@test.com",
        };
        const token = generateToken(mockUser);

        // Verify with wrong secret ,should give error

        expect(() => {
            jwt.verify(token, "wrong secret")
        }).toThrow();
    })
})