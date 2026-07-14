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

### 1. Repository Layer

The repository layer (`src/repositories/`) is responsible **only** for direct database CRUD operations.

- All database queries/updates are abstracted inside repositories.
- **Strict Rule:** Zero business logic validation, password hashing, token generation, or HTTP response handling exists in this layer.

### 2. Service Layer

The service layer contains the application's core business logic, including validations, hashing, JWT token generation, and workflow coordination.

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

---

## Automation & Quality Checks

### Pre-commit README Verification Hook

To ensure project changes are always documented, this repository features an automated checking utility:

- **Script**: [check-readme.js](file:///d:/Projects/Banking%20API/scripts/check-readme.js)
- **Command**: `npm run check-readme`
- **Git Hook**: Staged changes are validated before commit. If a commit contains significant modifications (such as new Prisma models, new route files, or new env references) but `README.md` has not been updated/staged, the commit is blocked.
- **Bypassing the check**: If you are sure a change does not require README updates, commit with `git commit --no-verify`.
