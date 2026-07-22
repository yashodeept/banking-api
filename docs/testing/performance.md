# Performance & Scalability

Our API is designed to scale horizontally behind a reverse proxy (Nginx).

## Bottleneck Mitigations
- **Database Locks**: Row-level locking ensures safety but can limit concurrent throughput on the *same* wallet. We enforce rapid transaction commits to keep lock windows under 10ms.
- **Idempotency Caching**: Payment endpoints consult Redis before processing, enabling us to sustain heavy webhook retry spikes.

## Load Testing Instructions
You can utilize tools like `k6` or `Artillery` to benchmark the API.

Example simple `artillery` command to stress the `/health` endpoint:
```bash
npx artillery quick --count 100 --num 50 http://localhost:5000/health
```

*For financial endpoints, always use the isolated test database during load tests.*
