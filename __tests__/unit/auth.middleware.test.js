const jwt = require("jsonwebtoken");
const protect = require("../../middleware/auth.middleware");

//Test environment setup

beforeAll(() => {
    process.env.JWT_SECRET = "test_secret_key_12345"
})

//Helper -- create fake req,res,next 

const createMockRes = () => {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
    return res;
}

describe("protect middleware -- Unit tests", () => {
    test("should return 401 when no authorization header provided", () => {
        const req = { headers: {} }; //no header
        const res = createMockRes();
        const next = jest.fn(); //to track next call

        protect(req, res, next);

        //res.status(401) has called?

        expect(res.status).toHaveBeenCalledWith(401);

        //res.json has called with correct message?

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining("Access denied")
            })
        )
        expect(next).not.toHaveBeenCalled()
    })


    // TEST 2.  "bASIC TOKEN "format ,if there is no bearer ,401

    test("should return 401 when there is no Bearer", () => {
        const req = {
            headers: { authorization: "Basic sometoken123" }
        };
        const res = createMockRes();
        const next = jest.fn();

        protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    })

    // TEST 3.  Invalid/Expired token -> 401
    test("should return 401 when token is invalid", () => {
        const req = {
            headers: { authorization: "Bearer invalid.token.here" },
        };
        const res = createMockRes();
        const next = jest.fn();

        protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining("Invalid")
            })
        );
        expect(next).not.toHaveBeenCalled()
    });

    //TEST 4.  Valid token -> next() should get called and req.user gets to set

    test("should call next() and set req.user with valid token", () => {
        //firstly,create a valid token

        const payload = {
            userId: "507f1f77bcf86cd799439011",
            role: "DOCTOR",
            email: "doctor@test.com",
        };
        const validToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });

        const req = {
            headers: { authorization: `Bearer ${validToken} ` },
        };
        const res = createMockRes();
        const next = jest.fn();

        protect(req, res, next);

        //Next() should call
        expect(next).toHaveBeenCalled();
        //data should be there in req.user
        expect(req.user).toBeDefined();
        expect(req.user.userId).toBe("507f1f77bcf86cd799439011");
        expect(req.user.role).toBe("DOCTOR");
        //res.status() not called ?
        expect(res.status).not.toHaveBeenCalled();
    })


})