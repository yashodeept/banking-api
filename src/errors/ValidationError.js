const AppError = require("./AppError");

class ValidationError extends AppError {
  constructor(message = "Validation Failed", details = []) {
    super(message, 422, "VALIDATION_FAILED", true);
    this.details = details;
  }
}

module.exports = ValidationError;
