const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const env = require("./env");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Banking API",
      version: "v1",
      description:
        "A secure, robust banking API built with Node.js, Express, and Prisma.",
      contact: {
        name: "Developer Support",
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: "Local Dev Target",
      },
      {
        url: `https://api.yourdomain.com/api/v1`,
        description: "Production Target",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // Paths to files containing OpenAPI JSDoc annotations
  apis: ["./src/docs/swagger/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Setup Swagger UI documentation endpoint on the Express application.
 *
 * @param {import('express').Application} app - The Express application instance
 */
function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = {
  setupSwagger,
  swaggerSpec,
};
