# API Documentation

Our API documentation is dynamically generated using `swagger-jsdoc` and `swagger-ui-express`.

## Accessing the Swagger UI
In any environment, you can access the interactive Swagger OpenAPI 3.0 documentation by visiting:
`GET /api-docs` (e.g., `http://localhost:5000/api-docs`).

## Domains Covered
The Swagger UI organizes endpoints via the following tags:
- **Authentication**: Login, Registration.
- **Users**: Profile management, Role updates.
- **Wallet**: Creation, Freezing, Balance Checks.
- **Transactions**: Transfers, Deposits, Withdrawals.
- **Payments**: Init, Verify, Webhooks.
- **Ledger & Audit**: Admin/Auditor reporting.

To update the Swagger schema, you can find the JSDoc comments physically co-located within the Route files inside `src/modules/`.
