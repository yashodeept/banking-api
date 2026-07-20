const AppError = require("./AppError");

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED", true);
  }
}

module.exports = UnauthorizedError;
