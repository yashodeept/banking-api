const AppError = require("./AppError");

class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409, "CONFLICT", true);
  }
}

module.exports = ConflictError;
