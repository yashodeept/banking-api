const { verifyAccessToken } = require("../utils/jwt");
const userRepository = require("../repositories/user.repository");
const { sendError } = require("../utils/response");

async function authenticate(req, res, next) {
  try {
    // 1. Extract Authorization Header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Authorization header is required", [], 401);
    }

    // 2. Verify Signature
    const token = authHeader.split(" ")[1];
    let decodedPayload;
    try {
      decodedPayload = verifyAccessToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return sendError(res, "Access token has expired", [], 401);
      }
      return sendError(res, "Invalid access token", [], 401);
    }

    // 3. Database Check
    const userId = decodedPayload.id;
    const dbUser = await userRepository.findUserById(userId);

    if (!dbUser) {
      return sendError(res, "User not found", [], 401);
    }

    if (["BLOCKED", "LOCKED", "INACTIVE"].includes(dbUser.status)) {
      return sendError(res, "Access denied. Account is compromised or suspended.", [], 403);
    }

    // 4. Context Injection
    req.user = { id: dbUser.id, email: dbUser.email, role: dbUser.role, status: dbUser.status };

    // 5. Pipeline Release
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authenticate,
};
