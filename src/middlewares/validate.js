/**
 * Express middleware to validate request parameters, query strings, and body payloads against Zod schemas.
 * Injects coerced/parsed results back into request object upon success.
 *
 * @param {object} schemas - Object containing Zod schemas for body, query, or params
 * @param {import('zod').ZodSchema} [schemas.body] - Zod schema for request body
 * @param {import('zod').ZodSchema} [schemas.query] - Zod schema for request query parameters
 * @param {import('zod').ZodSchema} [schemas.params] - Zod schema for request path variables
 */
const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.query) {
      req.query = schemas.query.parse(req.query);
    }
    if (schemas.params) {
      req.params = schemas.params.parse(req.params);
    }
    return next();
  } catch (error) {
    // Pass the ZodError directly to the global error handler
    return next(error);
  }
};

module.exports = validate;
