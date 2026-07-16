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

---

## Database Schema

We use Prisma with PostgreSQL. Below is the `User` model and `UserRole` enum currently implemented:

### `UserRole` Enum

- `ADMIN`: Administrator role with elevated permissions.
- `CUSTOMER`: Regular customer client role.
- `BANK`: Banking institution user role.
- `SUPPORT`: Customer support agent role.
- `AUDITOR`: External/internal auditor role.

### `User` Model

| Field          | Type       | Attributes / Modifiers    | Description                            |
| -------------- | ---------- | ------------------------- | -------------------------------------- |
| `id`           | `String`   | `@id`, `@default(cuid())` | Unique identifier.                     |
| `fullName`     | `String`   |                           | User's full name.                      |
| `email`        | `String`   | `@unique`                 | User's email address (unique).         |
| `password`     | `String`   |                           | Hashed password.                       |
| `role`         | `UserRole` | `@default(CUSTOMER)`      | User's permission level.               |
| `isVerified`   | `Boolean`  | `@default(false)`         | Flag indicating if email is verified.  |
| `refreshToken` | `String?`  | Optional                  | Refresh token for authentication flow. |
| `createdAt`    | `DateTime` | `@default(now())`         | Creation timestamp.                    |
| `updatedAt`    | `DateTime` | `@updatedAt`              | Automatic update timestamp.            |

### Database & Authentication Architecture Rules

#### 1. Password Security

- **Strict Rule:** Passwords must never be stored in plain text.
- **Implementation:** Always hash passwords securely (using bcrypt or argon2) prior to database insertion.

#### 2. Token Management

- Support for `refreshToken` is prepared in the `User` schema. This field will store tokens utilized in the upcoming Refresh Token authentication flow.

#### 3. Role-Based Access Control (RBAC)

- Simplifies authentication and authorization logic using the built-in `role` field aligned with standard roles: `ADMIN`, `CUSTOMER`, `BANK`, `SUPPORT`, and `AUDITOR`.

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

### 5. Middleware Layer

The middleware layer (`src/middlewares/`) handles cross-cutting concerns like global error handling, payload validation, and request authentication.

- **Authentication Interceptor:** The JWT Auth middleware verifies the token signature, checks the database to ensure the session/user is still valid (preventing stale sessions), and injects a sanitized payload into `req.user`.
- **Global Error Interceptor:** All exceptions are passed to this centralized handler. It dynamically translates native runtime failures, Prisma database constraints, and custom AppError instances into a uniform JSON response masking internal traces securely in production.

### 6. Utility Layer

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

### Setup & Run

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
4. Access Interactive Documentation (Swagger UI):
   Open `http://localhost:5000/api-docs` in your browser to view and test all available endpoints.

---

## Automation & Quality Checks

### Pre-commit README Verification Hook

To ensure project changes are always documented, this repository features an automated checking utility:

- **Script**: [check-readme.js](file:///d:/Projects/Banking%20API/scripts/check-readme.js)
- **Command**: `npm run check-readme`
- **Git Hook**: Staged changes are validated before commit. If a commit contains significant modifications (such as new Prisma models, new route files, or new env references) but `README.md` has not been updated/staged, the commit is blocked.
- **Bypassing the check**: If you are sure a change does not require README updates, commit with `git commit --no-verify`.
