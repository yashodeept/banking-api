# Database Entity-Relationship Diagram

Our PostgreSQL database enforces strict referential integrity and is mapped via Prisma.

```mermaid
erDiagram
    User ||--o| Wallet : owns
    User ||--o{ AuditLog : performs
    Wallet ||--o{ Transaction : initiates
    Transaction ||--|{ LedgerEntry : generates
    
    User {
        String id PK
        String customerId UK
        String fullName
        String email UK
        String password
        Enum role "CUSTOMER | ADMIN | BANK"
        Enum status "ACTIVE | BLOCKED"
    }
    
    Wallet {
        String id PK
        String walletNumber UK
        Decimal balance
        String currency
        Enum status "ACTIVE | FROZEN"
        String userId FK
    }

    Transaction {
        String id PK
        String reference UK
        Decimal amount
        String currency
        Enum type "DEPOSIT | WITHDRAWAL | TRANSFER"
        Enum status "PENDING | COMPLETED | FAILED"
        String sourceWalletId FK
        String destWalletId FK
    }

    LedgerEntry {
        String id PK
        String transactionId FK
        String walletId FK
        Enum type "CREDIT | DEBIT"
        Decimal amount
        Decimal balanceAfter
    }
    
    AuditLog {
        String id PK
        String entityName
        String entityId
        String action
        String performedBy FK
        Json changes
    }
```

### Core Relationships
- **User ➔ Wallet**: A strict $1:1$ relationship. A user can have only one core wallet.
- **Transaction ➔ LedgerEntry**: A $1:N$ relationship (usually 2 entries per transaction to represent Double-Entry Accounting: one DEBIT and one CREDIT).
