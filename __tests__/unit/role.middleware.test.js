const authorize = require("../../middleware/role.middleware");

//Helper - Fake res

const createMockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
});

describe("authorize Middleware - Unit Tests", () => {

    //Test 1: Correct role -> next() should call
    test("should call next() when user has allowed role", () => {
        //authorize('ADMIN') should return a middleware function

        const middleware = authorize('ADMIN');

        const req = { user: { role: 'ADMIN' } }; //ADMIN user
        const res = createMockRes();
        const next = jest.fn();

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    })

    //Test 2 : One should match from multiple roles -> pass
    test("should allowed access when user role is in multiple allowed roles", () => {
        const middleware = authorize("ADMIN", "RECEPTIONIST", "PATIENT");

        const req = { user: { role: "RECEPTIONIST" } };
        const res = createMockRes();
        const next = jest.fn();

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    })

    //Test 3 : Wrong role -> 403 forbidden
    test("should return 403 when user role is not allowed roles", () => {
        const middleware = authorize("ADMIN") //admin allowed only

        const req = { user: { role: "PATIENT" } }; //PATIENT
        const res = createMockRes();
        const next = jest.fn();

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining("Access denied")
            })
        );
        expect(next).not.toHaveBeenCalled
    })

    //Test 4 : Pateient came at Doctor route -> 403
    test("should return 403 when PATIENT tries DOCTOR-only route", () => {
        const middleware = authorize("DOCTOR");
        const req = { user: { role: "PATIENT" } };
        const res = createMockRes();
        const next = jest.fn();

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    })

    //Test 5: req,user is not there ,(protect is not use) => 401
    test("should return 401 when req.user is not set", () => {
        const middleware = authorize("ADMIN");

        const req = {}; //user not atached
        const res = createMockRes();
        const next = jest.fn();

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    })
})