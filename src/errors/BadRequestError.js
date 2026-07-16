const AppError = require('./AppError');

class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400, 'BAD_REQUEST', true);
  }
}

module.exports = BadRequestError;
