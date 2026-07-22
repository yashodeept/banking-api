# Architecture Decision Records (ADRs)

## ADR 1: Object-Relational Mapper (ORM)
- **Decision:** Prisma ORM.
- **Context:** Node.js ecosystem offers Sequelize, TypeORM, and Prisma. We need reliable type safety and robust transaction management.
- **Drivers:** Strict type-safety, simplified schema definition, and excellent migration tracking.
- **Trade-offs:** Heavier initial binary footprint; however, developer velocity and compile-time safety heavily outweigh this.

## ADR 2: Primary Data Store
- **Decision:** PostgreSQL.
- **Context:** Financial applications require strict ACID compliance and relational integrity.
- **Drivers:** Native support for row-level locking (`SELECT ... FOR UPDATE`), `DECIMAL` precision to avoid floating-point errors, and robust indexing.
- **Trade-offs:** Scaling horizontally is harder compared to NoSQL (MongoDB), but vertical scaling and read replicas solve our immediate scale targets.

## ADR 3: Double-Entry Accounting
- **Decision:** Dual-layer accounting engine (Wallet Balance + Ledger Entries).
- **Context:** Need immutable auditing of money movement. Simply updating a balance is prone to data loss and lacks trace history.
- **Drivers:** Creating paired Credit/Debit entries makes the system auditable by default.
- **Trade-offs:** Slower writes since every transfer inserts multiple rows. Mitigated by indexing and fast Postgres SSD performance.

## ADR 4: Background Processing & Queueing
- **Decision:** BullMQ on Redis.
- **Context:** Webhooks, payment retries, and notification tasks shouldn't block the main Express HTTP thread.
- **Drivers:** Leverage existing Redis infrastructure (used for caching/rate limiting) instead of introducing RabbitMQ or Kafka, keeping the stack simple.
- **Trade-offs:** In-memory queueing isn't as persistent as Kafka, but BullMQ offers persistence guarantees as long as Redis append-only file (AOF) is configured.

## ADR 5: Authentication Strategy
- **Decision:** Stateless JWT (JSON Web Tokens).
- **Context:** Securely verifying API requests without incurring database hits on every request.
- **Drivers:** Horizontal scalability across multiple API instances. We mitigate session invalidation by aggressively expiring access tokens and using database-backed refresh tokens.
- **Trade-offs:** Immediate token revocation is difficult; we use short-lived access tokens (15m) + Redis blocklists if required.
