const userRepository = require("../user/user.repository");
const { hashPassword, comparePassword } = require("../../shared/utils/bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../shared/utils/jwt");
const { MESSAGES } = require("../../shared/utils/constants");

// Custom Domain-Specific Errors
class EmailAlreadyExistsError extends Error {
  constructor(message = MESSAGES.EMAIL_ALREADY_EXISTS) {
    super(message);
    this.name = "EmailAlreadyExistsError";
  }
}

class InvalidCredentialsError extends Error {
  constructor(message = MESSAGES.INVALID_CREDENTIALS) {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}

class UnauthorizedError extends Error {
  constructor(message = MESSAGES.UNAUTHORIZED) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

class UserNotFoundError extends Error {
  constructor(message = MESSAGES.USER_NOT_FOUND) {
    super(message);
    this.name = "UserNotFoundError";
  }
}

/**
 * Sanitizes a user object to remove sensitive information.
 * @param {Object} user - The raw user database object.
 * @returns {Object} The sanitized user object.
 */
function sanitizeUser(user) {
  if (!user) return null;
  const sanitized = { ...user };
  delete sanitized.password;
  delete sanitized.refreshToken;
  return sanitized;
}

class AuthService {
  /**
   * Registers a new user.
   * @param {Object} userData - The registration data containing email, password, fullName, etc.
   * @returns {Promise<Object>} The sanitized created user record.
   */
  async register(userData) {
    const { email, password, fullName, role } = userData;

    // 1. Check if user already exists
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new EmailAlreadyExistsError();
    }

    // 2. Hash the password only after verifying email uniqueness
    const hashedPassword = await hashPassword(password);

    // 3. Create the user
    const newUser = await userRepository.createUser({
      fullName,
      email,
      password: hashedPassword,
      role, // defaulted to CUSTOMER in schema if omitted
    });

    // 4. Return sanitized data
    return sanitizeUser(newUser);
  }

  /**
   * Authenticates a user and returns a session.
   * @param {Object} credentials - Email and password.
   * @returns {Promise<Object>} The sanitized user object and tokens.
   */
  async login(credentials) {
    const { email, password } = credentials;

    // 1. Fetch user by email
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // 2. Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // 3. Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // 4. Persist refresh token session in database
    await userRepository.updateRefreshToken(user.id, refreshToken);

    // 5. Return sanitized user and tokens
    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Logs out a user by invalidating their refresh token.
   * @param {string} userId - The user ID.
   * @returns {Promise<Object>} Success confirmation.
   */
  async logout(userId) {
    await userRepository.deleteRefreshToken(userId);
    return {
      success: true,
      message: MESSAGES.LOGOUT_SUCCESS,
    };
  }

  /**
   * Issues a new access token using a valid refresh token.
   * @param {string} refreshToken - The active refresh token.
   * @returns {Promise<Object>} The new access token.
   */
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError(MESSAGES.REFRESH_TOKEN_REQUIRED);
    }

    try {
      // 1. Cryptographically verify the refresh token
      verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError(MESSAGES.INVALID_REFRESH_TOKEN);
    }

    // 2. Fetch the user matching the refresh token in the database
    const user = await userRepository.findUserByRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedError(MESSAGES.SESSION_REVOKED);
    }

    // 3. Issue new access token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(tokenPayload);

    return {
      accessToken,
    };
  }

  /**
   * Fetches the sanitized user profile.
   * @param {string} userId - The user ID.
   * @returns {Promise<Object>} The sanitized user profile.
   */
  async getProfile(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return sanitizeUser(user);
  }
}

module.exports = {
  AuthService: new AuthService(), // export as instance for singleton consumption
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  UnauthorizedError,
  UserNotFoundError,
};
