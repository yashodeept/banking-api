const ROLES = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
  BANK: "BANK",
  SUPPORT: "SUPPORT",
  AUDITOR: "AUDITOR",
};

const MESSAGES = {
  USER_CREATED: "User registered successfully",
  LOGIN_SUCCESS: "Login successful",
  INVALID_CREDENTIALS: "Invalid email or password",
  UNAUTHORIZED: "Unauthorized or invalid session",
  FORBIDDEN: "Forbidden access",
  EMAIL_ALREADY_EXISTS: "Email is already registered",
  USER_NOT_FOUND: "User not found",
  LOGOUT_SUCCESS: "Logged out successfully",
  REFRESH_TOKEN_REQUIRED: "Refresh token is required",
  INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
  SESSION_REVOKED: "Session not found or revoked",
  VALIDATION_FAILED: "Validation failed",
};

const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const JWT_CONFIG = {
  ACCESS_EXPIRY: "15m",
  REFRESH_EXPIRY: "7d",
  ACCESS_SECRET_DEFAULT:
    "default-jwt-secret-key-for-local-dev-only-banking-api",
  REFRESH_SECRET_DEFAULT:
    "default-jwt-refresh-secret-key-for-local-dev-only-banking-api",
};

module.exports = {
  ROLES,
  MESSAGES,
  STATUS_CODES,
  JWT_CONFIG,
};
