# Integration Testing Matrix

We ensure quality and regression-prevention via a robust suite of Jest and Supertest integration tests.

## Test Environment Isolation
All tests execute against a dedicated, isolated test database (`banking_test_db`). The Prisma `DATABASE_URL` is securely overridden in the `.env.test` configuration.

## Coverage Areas
Our Integration Matrix asserts:
1. **Authentication Boundary**: Checks JWT issuance, denial of expired tokens, and RBAC rejection (e.g., `CUSTOMER` attempting to access `/api/v1/ledger`).
2. **Financial Atomicity**: Triggers concurrent Transfer requests to assert that Prisma `SELECT FOR UPDATE` prevents negative balance race conditions.
3. **Webhook Verification**: Mocks external gateway payloads to assert asynchronous event triggers inside BullMQ.

## Running Tests
Ensure your test database container is running.
```bash
npm run test:db:setup
npm test
```
