# Banking API

A modern, secure, and robust RESTful Banking API built using Node.js, Express, Prisma, and PostgreSQL.

## Features

- **User Authentication & Authorization**: Roles include `USER` and `ADMIN`.
- **Database Migrations**: Controlled schema changes via Prisma.
- **Robust Security**: Rate-limiting, security headers (Helmet), CORS, compression, and JWT authentication.
- **Interactive Documentation**: Swagger OpenAPI UI.

---

## Tech Stack

- **Core**: Node.js & Express
- **ORM**: Prisma (v7.8.0)
- **Database**: PostgreSQL (with PG Driver Adapter)
- **Validation**: Zod
- **Logger**: Winston
- **Task Queue**: BullMQ & Redis (For asynchronous payment/webhook processing)

---

## Database Schema

We use Prisma with PostgreSQL. Below is the `User` model and `UserRole` enum currently implemented:

### `UserRole` Enum

- `ADMIN`: Administrator role with elevated permissions.
- `CUSTOMER`: Regular customer client role.
- `BANK`: Banking institution user role.
- `SUPPORT`: Customer support agent role.
- `AUDITOR`: External/internal auditor role.

### `UserStatus` Enum

- `ACTIVE`: Normal user state.
- `INACTIVE`: User soft-deleted or pending activation.
- `BLOCKED`: User is administratively blocked.
- `LOCKED`: User is locked due to security constraints.

### `WalletStatus` Enum

- `ACTIVE`: Wallet is open and functional.
- `FROZEN`: Wallet interactions are suspended.
- `CLOSED`: Wallet is terminated.

### `User` Model

| Field          | Type         | Attributes / Modifiers    | Description                            |
| -------------- | ------------ | ------------------------- | -------------------------------------- |
| `id`           | `String`     | `@id`, `@default(cuid())` | Unique identifier.                     |
| `customerId`   | `String`     | `@unique`                 | Unique customer domain ID.             |
| `fullName`     | `String`     |                           | User's full name.                      |
| `email`        | `String`     | `@unique`                 | User's email address (unique).         |
| `phone`        | `String?`    | `@unique`                 | User's phone number.                   |
| `password`     | `String`     |                           | Hashed password.                       |
| `role`         | `UserRole`   | `@default(CUSTOMER)`      | User's permission level.               |
| `status`       | `UserStatus` | `@default(ACTIVE)`        | User lifecycle state.                  |
| `isVerified`   | `Boolean`    | `@default(false)`         | Flag indicating if email is verified.  |
| `refreshToken` | `String?`    | Optional                  | Refresh token for authentication flow. |
| `lastLogin`    | `DateTime?`  | Optional                  | Timestamp of last active login.        |
| `createdAt`    | `DateTime`   | `@default(now())`         | Creation timestamp.                    |
| `updatedAt`    | `DateTime`   | `@updatedAt`              | Automatic update timestamp.            |
| `wallet`       | `Wallet?`    | Relation                  | One-to-one relationship with Wallet.   |

### `Wallet` Model

| Field          | Type           | Attributes / Modifiers       | Description                           |
| -------------- | -------------- | ---------------------------- | ------------------------------------- |
| `id`           | `String`       | `@id`, `@default(cuid())`    | Unique identifier.                    |
| `walletNumber` | `String`       | `@unique`                    | Unalterable cryptographic identifier. |
| `balance`      | `Decimal`      | `@default(0.00) @db.Decimal` | Financial balance (Decimal type).     |
| `currency`     | `String`       | `@default("INR")`            | Fiat currency code.                   |
| `status`       | `WalletStatus` | `@default(ACTIVE)`           | Wallet lifecycle state.               |
| `userId`       | `String`       | `@unique`                    | Reference to User owner.              |
| `createdAt`    | `DateTime`     | `@default(now())`            | Creation timestamp.                   |
| `updatedAt`    | `DateTime`     | `@updatedAt`                 | Automatic update timestamp.           |

### Database & Authentication Architecture Rules

#### 1. Password Security

- **Strict Rule:** Passwords must never be stored in plain text.
- **Implementation:** Always hash passwords securely (using bcrypt or argon2) prior to database insertion.

#### 2. Token Management

- Support for `refreshToken` is prepared in the `User` schema. This field will store tokens utilized in the upcoming Refresh Token authentication flow.

#### 3. Role-Based Access Control (RBAC)

- Simplifies authentication and authorization logic using the built-in `role` field aligned with standard roles: `ADMIN`, `CUSTOMER`, `BANK`, `SUPPORT`, and `AUDITOR`.

#### 4. Lifecycle Interception

- Identity & Wallet domains dynamically intercept BLOCKED, LOCKED, or INACTIVE status directly inside the authorization pipeline, preventing compromised accounts from further activity.

#### 5. Financial Immutability

- Wallet balances use `@db.Decimal(18,2)` to prevent JavaScript floating-point rounding errors.
- `walletNumber` and user/wallet relationships remain immutable. Closed wallets cannot be reopened.

---

## API Endpoints Overview

### User Operations

- `GET /api/v1/users/me`: Fetch authenticated user profile.
- `PATCH /api/v1/users/me`: Update profile details.
- `PATCH /api/v1/users/change-password`: Update credentials.
- `DELETE /api/v1/users/me`: Soft-delete account.
- `GET /api/v1/users`: List all profiles (Requires `ADMIN` or `AUDITOR`).
- `PATCH /api/v1/users/:id/status`: Change user lifecycle status (Requires `ADMIN`).
- `PATCH /api/v1/users/:id/role`: Change user role (Requires `ADMIN`).

### Wallet Operations

- `POST /api/v1/wallet`: Create personal wallet instance.
- `GET /api/v1/wallet`: Fetch active wallet details.
- `PATCH /api/v1/wallet/freeze`: Suspend wallet transactions (Requires `ADMIN`).
- `PATCH /api/v1/wallet/unfreeze`: Restore wallet access (Requires `ADMIN`).
- `PATCH /api/v1/wallet/close`: Terminate active wallet (Irreversible).

### Transaction Operations

- `POST /api/v1/transactions/deposit`: Deposit funds.
- `POST /api/v1/transactions/withdraw`: Withdraw funds.
- `POST /api/v1/transactions/transfer`: Transfer funds to another account.
- `GET /api/v1/transactions`: Fetch transaction history.
- `GET /api/v1/transactions/:reference`: View transaction details.

### Ledger Operations

- `GET /api/v1/ledger`: Fetch all ledger entries (Requires `ADMIN`, `AUDITOR`).
- `GET /api/v1/ledger/:transactionRef`: Audit ledger entries by transaction (Requires `ADMIN`, `AUDITOR`).

### Payment Operations

- `POST /api/v1/payments`: Initialize transaction request (Supports Idempotency).
- `POST /api/v1/payments/verify`: Reconcile gateway hooks.
- `POST /api/v1/payments/retry`: Re-trigger a failed payment attempt.
- `GET /api/v1/payments`: Fetch personal history log.
- `GET /api/v1/payments/:reference`: Fetch specific transaction record.

### Audit Reporting

- `GET /api/v1/audit`: Fetch all data mutation logs (Requires `ADMIN`, `AUDITOR`).
- `GET /api/v1/audit/user/:id`: Track specific consumer action history (Requires `ADMIN`, `AUDITOR`).
- `GET /api/v1/audit/entity/:entity`: Monitor structural model updates (Requires `ADMIN`, `AUDITOR`).

### External Webhooks

- `POST /api/v1/webhooks/payment`: Ingest status callbacks from external payment partners.

---

## Architectural Design & Layer Isolation

This project strictly adheres to a layered architecture: **Controller ➔ Service ➔ Repository ➔ Prisma Client ➔ PostgreSQL**.

### 1. Controller Layer

The controller layer (`src/controllers/`) acts strictly as an adapter mapping HTTP requests to service invocations.

- **Strict Rule:** Controllers must remain "thin" and contain absolutely zero business logic, database queries, password hashing, or token generation.
- All errors are passed downward using `next(error)` to a centralized global error handler.
- Responses are formatted exclusively via the response utility.

### 2. Repository Layer

The repository layer (`src/repositories/`) is responsible **only** for direct database CRUD operations.

- All database queries/updates are abstracted inside repositories.
- **Strict Rule:** Zero business logic validation, password hashing, token generation, or HTTP response handling exists in this layer.

### 3. Service Layer

The service layer contains the application's core business logic, including validations, hashing, JWT token generation, and workflow coordination.

- **Strict Rule:** Services and repositories must never return error shapes or HTTP status codes. They must explicitly throw a semantic error instance (e.g., `new ConflictError('User exists')`).

### 4. Validation Layer

Request payloads are intercepted and validated at the route boundary using Zod schemas (`src/validators/`) and a higher-order middleware factory (`src/middlewares/validation.middleware.js`).

- **Fail-Fast Policy:** Bad requests are immediately terminated and return a `400 Bad Request` status.
- **Unified Error payload:** Outputs errors normalized via the standardized response utility.

### 5. Ledger Engine & Concurrency Guardrails

To prevent race conditions and ensure immutable financial boundaries, the system uses a dual-layer accounting architecture:

- **Atomic Transactions:** Uses `prisma.$transaction` block enclosures so any runtime exception rolls back all actions instantly.
- **Pessimistic Locking:** Raw `SELECT ... FOR UPDATE` SQL queries are performed inside Prisma transactions to acquire database row locks on Wallet records.
- **Ledger Records:** The `LedgerEntry` model represents an append-only append-only truth. Wallet `balance` serves only as a materialized read-cache layer that updates in real time with the ledger.

### 6. Middleware Layer

The middleware layer (`src/middlewares/`) handles cross-cutting concerns like global error handling, payload validation, and request authentication.

- **Authentication Interceptor:** The JWT Auth middleware verifies the token signature, checks the database to ensure the session/user is still valid (preventing stale sessions), and injects a sanitized payload into `req.user`.
- **Global Error Interceptor:** All exceptions are passed to this centralized handler. It dynamically translates native runtime failures, Prisma database constraints, and custom AppError instances into a uniform JSON response masking internal traces securely in production.

### 6. Payment Engine & Idempotency

- **Strict Idempotency Constraints:** Incoming payment requests are intercepted via an `Idempotency-Key` header. Responses are securely cached in a Redis high-speed data store. Identical requests instantly short-circuit processing, returning the exact cached response body without executing downstream database operations.
- **Atomic Execution:** Core financial updates and INITIATED state tracks are executed safely inside a `prisma.$transaction()` block.

### 7. Event-Driven Asynchronous Processing

- **Domain Event Decoupling:** Downstream jobs (notification, webhooks, third-party syncs) are decoupled from the main process thread. After core states are stored, strongly typed events (e.g., `PAYMENT_SUCCESS`) are emitted to BullMQ queues.
- **Background Workers:** High-latency tasks are processed out-of-band by dedicated worker consumers, ensuring the primary Express execution thread never blocks.

### 8. Immutable Audit Trail

- **Mutation Tracking:** Record mutations are securely logged inside the `AuditLog` table on a system level. This model operates strictly as append-only.

### 9. Utility Layer

Contains reusable helper utilities and configuration:

- `constants.js`: Single source of truth for roles, messaging strings, and status codes.
- `response.js`: Unifies successful and error API response structures.
- `jwt.js` & `bcrypt.js`: Encapsulates cryptographic operations.

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL instance running locally or remotely

### Environment Variables

Configure the `.env` file in the root directory:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<dbname>"
PORT=5000
JWT_SECRET="your-secure-jwt-access-secret"
JWT_REFRESH_SECRET="your-secure-jwt-refresh-secret"
```

### Setup & Run (Local Development)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Apply database migrations:
   ```bash
   npx prisma migrate dev
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Setup & Run (Docker / Production Ready)

To spin up the entire application stack (API, Background Worker, PostgreSQL, Redis, and Nginx proxy):

1. **Build and start the containers:**
   ```bash
   docker-compose up --build -d
   ```
2. **Verify Service Health:**
   ```bash
   curl http://localhost/health
   # Expected output: {"status":"UP","database":"UP","redis":"UP",...}
   ```
3. **View Logs (Winston JSON Structured output):**
   ```bash
   docker-compose logs -f bank-api
   ```
4. **Shutdown Gracefully:**
   ```bash
   docker-compose down
   ```

### Access Interactive Documentation (Swagger UI)
Open `http://localhost:5000/api-docs` (or `http://localhost/api-docs` via Docker Nginx) in your browser to view and test all available endpoints.

---

## Automation & Quality Checks

### Integration & Security Testing

This project utilizes `Jest` and `Supertest` to comprehensively verify integration pipelines and security boundaries. Tests automatically run against an isolated test database defined in `.env.test`.

**To execute the test suite locally:**

1. Ensure your PostgreSQL instance is running.
2. Initialize the isolated test database schema:
   ```bash
   npm run test:db:setup
   ```
3. Run the automated test matrix:
   ```bash
   npm run test
   ```

### Pre-commit README Verification Hook

To ensure project changes are always documented, this repository features an automated checking utility:

- **Script**: [check-readme.js](file:///d:/Projects/Banking%20API/scripts/check-readme.js)
- **Command**: `npm run check-readme`
- **Git Hook**: Staged changes are validated before commit. If a commit contains significant modifications (such as new Prisma models, new route files, or new env references) but `README.md` has not been updated/staged, the commit is blocked.
- **Bypassing the check**: If you are sure a change does not require README updates, commit with `git commit --no-verify`.
