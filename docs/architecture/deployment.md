# Deployment Strategy

The platform is designed to be highly available and resilient, deployable via Docker and orchestrated via Docker Compose for self-hosted environments.

## Docker & Containerization
We utilize a multi-stage `Dockerfile` based on `node:20-alpine`. The final production image discards all development dependencies and runs as a restricted `appuser` (non-root) to mitigate privilege escalation vulnerabilities.

## Nginx Edge Proxy
An Nginx reverse proxy sits at the edge (listening on port 80/443). It terminates SSL (in a true production setup) and forwards traffic to the internal Express backend (port 5000). It also injects essential forwarding headers (`X-Real-IP`, `X-Forwarded-For`).

## Production Deployment Steps

1. **Environment Setup**:
   Copy `.env.example` to `.env` and fill in the production secrets (`JWT_SECRET`, `DATABASE_URL`, etc.).

2. **Database Initialization**:
   Ensure PostgreSQL and Redis are accessible. If using the provided compose file, they are auto-provisioned.

3. **Spin up the stack**:
   ```bash
   docker-compose up --build -d
   ```
   This command starts:
   - `postgres`: Data store for the banking logic.
   - `redis`: High-speed cache and rate-limit store.
   - `bank-api`: The Express backend application.
   - `worker`: Background job processors pulling from BullMQ.
   - `nginx`: Reverse proxy exposing port 80.

4. **Monitoring**:
   Monitor the structured Winston logs output from the API:
   ```bash
   docker-compose logs -f bank-api
   ```
