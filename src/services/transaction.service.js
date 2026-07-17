const prisma = require("../lib/prisma");
const transactionRepository = require("../repositories/transaction.repository");
const walletRepository = require("../repositories/wallet.repository");
const ledgerService = require("./ledger.service");
const crypto = require("crypto");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");

class TransactionService {
  /**
   * Generates a unique transaction reference (e.g., TX-A1B2C3D4E5F6)
   */
  _generateTxRef() {
    return "TX-" + crypto.randomBytes(6).toString("hex").toUpperCase();
  }

  /**
   * Validates common constraints for transactions
   */
  _validateConstraints(wallet, amount) {
    if (amount <= 0) {
      throw new BadRequestError("Transaction amount must be strictly greater than zero");
    }
    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }
    if (wallet.status !== "ACTIVE") {
      throw new BadRequestError(`Wallet is ${wallet.status}. Active status required.`);
    }
  }

  /**
   * Executes a deposit transaction.
   * @param {string} receiverWalletId 
   * @param {number} amount 
   * @param {string} createdBy 
   * @param {string} description 
   */
  async deposit(receiverWalletId, amount, createdBy, description) {
    return prisma.$transaction(async (tx) => {
      // 1. Acquire Database Lock
      const wallets = await tx.$queryRaw`SELECT * FROM "Wallet" WHERE id = ${receiverWalletId} FOR UPDATE`;
      const wallet = wallets[0];
      
      this._validateConstraints(wallet, amount);

      // 2. Initialize PENDING transaction
      let transaction = await transactionRepository.createTransaction(
        {
          transactionRef: this._generateTxRef(),
          type: "DEPOSIT",
          status: "PENDING",
          amount,
          description,
          receiverWalletId,
          createdBy,
        },
        tx
      );

      // 3. Update Balance Cache & Write Ledger Entry (Atomic)
      await ledgerService.postTransaction(
        {
          transactionId: transaction.id,
          walletId: receiverWalletId,
          entryType: "CREDIT",
          amount,
          currentBalance: wallet.balance,
        },
        tx
      );

      // 4. Mark transaction as SUCCESS
      transaction = await transactionRepository.updateTransactionStatus(transaction.id, "SUCCESS", tx);
      return transaction;
    });
  }

  /**
   * Executes a withdraw transaction.
   * @param {string} senderWalletId 
   * @param {number} amount 
   * @param {string} createdBy 
   * @param {string} description 
   */
  async withdraw(senderWalletId, amount, createdBy, description) {
    return prisma.$transaction(async (tx) => {
      // 1. Acquire Database Lock
      const wallets = await tx.$queryRaw`SELECT * FROM "Wallet" WHERE id = ${senderWalletId} FOR UPDATE`;
      const wallet = wallets[0];
      
      this._validateConstraints(wallet, amount);
      if (Number(wallet.balance) - amount < 0) {
        throw new BadRequestError("Insufficient funds for withdrawal");
      }

      // 2. Initialize PENDING transaction
      let transaction = await transactionRepository.createTransaction(
        {
          transactionRef: this._generateTxRef(),
          type: "WITHDRAW",
          status: "PENDING",
          amount,
          description,
          senderWalletId,
          createdBy,
        },
        tx
      );

      // 3. Update Balance Cache & Write Ledger Entry (Atomic)
      await ledgerService.postTransaction(
        {
          transactionId: transaction.id,
          walletId: senderWalletId,
          entryType: "DEBIT",
          amount,
          currentBalance: wallet.balance,
        },
        tx
      );

      // 4. Mark transaction as SUCCESS
      transaction = await transactionRepository.updateTransactionStatus(transaction.id, "SUCCESS", tx);
      return transaction;
    });
  }

  /**
   * Executes a transfer transaction between two wallets.
   * @param {string} senderWalletId 
   * @param {string} receiverWalletId 
   * @param {number} amount 
   * @param {string} createdBy 
   * @param {string} description 
   */
  async transfer(senderWalletId, receiverWalletId, amount, createdBy, description) {
    if (senderWalletId === receiverWalletId) {
      throw new BadRequestError("Cannot transfer funds to the same wallet");
    }

    return prisma.$transaction(async (tx) => {
      // 1. Acquire Database Locks (ordering by ID to prevent deadlocks)
      const lockQuery = await tx.$queryRaw`
        SELECT * FROM "Wallet" 
        WHERE id IN (${senderWalletId}, ${receiverWalletId}) 
        ORDER BY id 
        FOR UPDATE
      `;

      if (lockQuery.length !== 2) {
        throw new NotFoundError("One or both wallets not found");
      }

      const senderWallet = lockQuery.find((w) => w.id === senderWalletId);
      const receiverWallet = lockQuery.find((w) => w.id === receiverWalletId);

      // 2. Validate Constraints
      this._validateConstraints(senderWallet, amount);
      this._validateConstraints(receiverWallet, amount);

      if (Number(senderWallet.balance) - amount < 0) {
        throw new BadRequestError("Insufficient funds for transfer");
      }

      // 3. Initialize PENDING transaction
      let transaction = await transactionRepository.createTransaction(
        {
          transactionRef: this._generateTxRef(),
          type: "TRANSFER",
          status: "PENDING",
          amount,
          description,
          senderWalletId,
          receiverWalletId,
          createdBy,
        },
        tx
      );

      // 4. Deduct from Sender
      await ledgerService.postTransaction(
        {
          transactionId: transaction.id,
          walletId: senderWalletId,
          entryType: "DEBIT",
          amount,
          currentBalance: senderWallet.balance,
        },
        tx
      );

      // 5. Add to Receiver
      await ledgerService.postTransaction(
        {
          transactionId: transaction.id,
          walletId: receiverWalletId,
          entryType: "CREDIT",
          amount,
          currentBalance: receiverWallet.balance,
        },
        tx
      );

      // 6. Mark transaction as SUCCESS
      transaction = await transactionRepository.updateTransactionStatus(transaction.id, "SUCCESS", tx);
      return transaction;
    });
  }

  async getTransactionHistory(walletId) {
    return transactionRepository.findUserTransactions(walletId);
  }

  async getTransactionDetails(transactionRef) {
    const tx = await transactionRepository.findTransactionByReference(transactionRef);
    if (!tx) {
      throw new NotFoundError("Transaction not found");
    }
    return tx;
  }
}

module.exports = new TransactionService();
