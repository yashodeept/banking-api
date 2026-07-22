# Security & Compliance Checklist

## Global Configurations
- [x] **Helmet**: Enforces strict transport security and removes the `X-Powered-By` header.
- [x] **CORS**: Restricted in production to whitelisted origins.
- [x] **Rate Limiting**: Integrated `express-rate-limit` + Redis, preventing Brute Force attacks. (100 req / 15 min per IP globally).
- [x] **Payload Limitation**: Body parser capped at `10kb` to thwart DOS attacks.

## Identity & Access Management (IAM)
- [x] **RBAC**: Implemented role-based boundaries (`ADMIN`, `CUSTOMER`, `AUDITOR`).
- [x] **Password Storage**: Hashed via `bcrypt` (Salt Rounds = 12).
- [x] **Account Freezing**: Hard-checks on user and wallet statuses (`FROZEN`, `BLOCKED`, `LOCKED`).

## Data Injection & Exposure
- [x] **Validation**: Strict schema validation using Zod prevents NoSQL-style logic injections and validates string patterns.
- [x] **Database Safety**: Prisma acts as the query builder, automatically escaping payloads preventing SQL Injection (SQLi).
- [x] **Error Handling**: Custom error handler masks stack traces in `production` environments to prevent path/information leakage.
