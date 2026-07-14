const { sendError } = require("../utils/response");
const { STATUS_CODES, MESSAGES } = require("../utils/constants");

/**
 * Reusable Express middleware factory for Zod validation.
 * Accepts either a single Zod schema (which defaults to validating req.body)
 * or a schema wrapper object containing optional body, query, or params Zod schemas.
 *
 * @param {import('zod').ZodSchema|Object} schema - Zod schema or object containing body/query/params schemas
 * @returns {Function} Express middleware function
 */
const validate = (schema) => (req, res, next) => {
  try {
    if (schema.safeParse) {
      // Direct schema passed - default to validating the body
      req.body = schema.parse(req.body);
    } else {
      // Compound schema passed (e.g. { body, query, params })
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
    }
    return next();
  } catch (error) {
    if (error.name === "ZodError") {
      // Transform Zod's internal error tree into the unified app payload
      const formattedErrors = error.errors.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return sendError(
        res,
        MESSAGES.VALIDATION_FAILED,
        formattedErrors,
        STATUS_CODES.BAD_REQUEST,
      );
    }
    return next(error);
  }
};

module.exports = validate;
