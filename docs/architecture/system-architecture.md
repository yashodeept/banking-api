# System Architecture

The Banking Platform is built on a **Domain-Driven Modular Design** leveraging Node.js and Express, backed by PostgreSQL for transactional integrity and Redis for caching and rate limiting.

## High-Level Architecture Diagram

```mermaid
graph TD
    Client[Client App / Postman] -->|HTTP/REST| Nginx[Nginx Reverse Proxy]
    Nginx -->|Port 5000| API[Express API Gateway]
    
    subgraph Express Backend
        API --> Auth[Authentication Middleware]
        API --> Validate[Validation Middleware]
        API --> Router[API Routes]
        
        Router --> UserModule[User & Auth Domain]
        Router --> WalletModule[Wallet Domain]
        Router --> TxModule[Transaction & Ledger Domain]
        Router --> PaymentModule[Payment Domain]
    end

    subgraph Data Layer
        UserModule --> Prisma[(Prisma ORM)]
        WalletModule --> Prisma
        TxModule --> Prisma
        PaymentModule --> Prisma
        
        Prisma --> DB[(PostgreSQL)]
        
        Auth --> RedisCache[(Redis)]
        PaymentModule --> RedisCache
    end
    
    subgraph Background Processing
        PaymentModule -->|Produce Event| BullMQ[BullMQ Queue]
        BullMQ --> Worker[Background Worker]
        Worker --> DB
    end

    classDef proxy fill:#f96,stroke:#333,stroke-width:2px;
    classDef api fill:#69b,stroke:#333,stroke-width:2px;
    classDef db fill:#5a5,stroke:#333,stroke-width:2px;
    classDef cache fill:#e53,stroke:#333,stroke-width:2px;
    
    class Nginx proxy;
    class API,UserModule,WalletModule,TxModule,PaymentModule api;
    class DB db;
    class RedisCache cache;
```

## Architectural Highlights
1. **Clean Architecture Layering**: Strict isolation between Controllers, Services, and Repositories.
2. **Double-Entry Accounting**: Transactions result in atomic double-entry records inside the Ledger.
3. **Event-Driven Workers**: High-latency webhooks and side-effects are decoupled using BullMQ.
