const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../app");
const { prisma } = require("../../config/db");
const { JWT_CONFIG } = require("../../utils/constants");

describe("Integration & Security Testing: Auth Pipeline", () => {
  const registerPayload = {
    fullName: "Test User",
    email: "test@example.com",
    password: "Password123!",
  };

  describe("15.1 Registration Pipeline Assertions", () => {
    it("Success Flow -> Issue a complete payload", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(registerPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.email).toBe(registerPayload.email);
      expect(res.body.data.password).toBeUndefined();
      expect(res.body.data.refreshToken).toBeUndefined();
    });

    it("Duplicate Exception Handling -> Conflict on duplicate email", async () => {
      await request(app).post("/api/v1/auth/register").send(registerPayload);

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(registerPayload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("CONFLICT");
    });

    it("Format Interception -> Invalid payload triggers validation error", async () => {
      const invalidPayload = {
        fullName: "Test User",
        password: "Password123!",
      }; // missing email
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.details).toBeDefined();
    });
  });

  describe("15.2 Authentication & Token Lifecycles", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(registerPayload);
    });

    it("Successful Login -> Returns valid access & refresh tokens", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: registerPayload.email,
        password: registerPayload.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(typeof res.body.data.accessToken).toBe("string");
      expect(typeof res.body.data.refreshToken).toBe("string");
    });

    it("Credential Rejection -> Invalid credentials yield uniform 401", async () => {
      const resInvalidPassword = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: registerPayload.email,
          password: "wrongpassword",
        });
      expect(resInvalidPassword.status).toBe(401);
      expect(resInvalidPassword.body.error.code).toBe("UNAUTHORIZED");

      const resUnregisteredEmail = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "nobody@example.com",
          password: "Password123!",
        });
      expect(resUnregisteredEmail.status).toBe(401);
      expect(resUnregisteredEmail.body.error.code).toBe("UNAUTHORIZED");

      // Asserts uniform messaging for user privacy
      expect(resInvalidPassword.body.message).toBe(
        resUnregisteredEmail.body.message,
      );
    });

    it("Session Revocation (Logout) -> Instant subsequent blocking", async () => {
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: registerPayload.email,
        password: registerPayload.password,
      });
      const token = loginRes.body.data.accessToken;

      const logoutRes = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${token}`);
      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      const profileRes = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", `Bearer ${token}`);
      expect(profileRes.status).toBe(401);
    });
  });

  describe("15.3 JWT Interception & Boundary Safeguards", () => {
    let activeToken = "";

    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(registerPayload);
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: registerPayload.email,
        password: registerPayload.password,
      });
      activeToken = loginRes.body.data.accessToken;
    });

    it("Missing Token -> Assert 401 Unauthorized", async () => {
      const res = await request(app).get("/api/v1/auth/profile");
      expect(res.status).toBe(401);
    });

    it("Malformed Format -> Assert 401 Unauthorized", async () => {
      const res = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", "Bearer invalid-token-string");
      expect(res.status).toBe(401);
    });

    it("Expired Context -> Assert 401 Unauthorized", async () => {
      // Simulate expired token manually signing with negative lifetime
      const JWT_SECRET =
        process.env.JWT_SECRET || JWT_CONFIG.ACCESS_SECRET_DEFAULT;
      const expiredToken = jwt.sign(
        { id: "dummy", email: "dummy@test.com", role: "CUSTOMER" },
        JWT_SECRET,
        { expiresIn: "-1s" },
      );

      const res = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Access token has expired");
    });

    it("Active Session Invalidation (The Deleted User Rule)", async () => {
      // Drop user directly from PostgreSQL wrapper instance to simulate deletion/deactivation
      await prisma.user.deleteMany({ where: { email: registerPayload.email } });

      // Hit profile endpoint with perfectly valid active token
      const res = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", `Bearer ${activeToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("User not found");
    });
  });
});
