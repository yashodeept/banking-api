const ledgerRepository = require("./ledger.repository");
const walletRepository = require("../wallet/wallet.repository");
const { Prisma } = require("@prisma/client");

class LedgerService {
  /**
   * Posts a transaction to the ledger and updates the wallet balance.
   * This is a low-level primitive intended to be run inside a transaction block.
   *
   * @param {Object} params
   * @param {string} params.transactionId
   * @param {string} params.walletId
   * @param {string} params.entryType - 'DEBIT' or 'CREDIT'
   * @param {number|Prisma.Decimal} params.amount
   * @param {number|Prisma.Decimal} params.currentBalance
   * @param {Object} tx - The active Prisma transaction client
   */
  async postTransaction(
    { transactionId, walletId, entryType, amount, currentBalance },
    tx,
  ) {
    if (!tx) {
      throw new Error(
        "postTransaction requires an active database transaction context",
      );
    }

    const decimalAmount = new Prisma.Decimal(amount);
    const decimalCurrentBalance = new Prisma.Decimal(currentBalance);

    // 1. Compute new balance using safe decimal math
    const balanceAfter =
      entryType === "CREDIT"
        ? decimalCurrentBalance.plus(decimalAmount)
        : decimalCurrentBalance.minus(decimalAmount);

    // 2. Write immutable ledger entry
    const ledgerEntry = await ledgerRepository.createLedgerEntry(
      {
        transactionId,
        walletId,
        entryType,
        amount: decimalAmount,
        balanceAfter,
      },
      tx,
    );

    // 3. Update the materialized cache layer (Wallet balance)
    await walletRepository.updateWalletBalance(walletId, balanceAfter, tx);

    return ledgerEntry;
  }

  /**
   * Utility to compute the running balance dynamically from the ledger.
   * Ensures the cached Wallet.balance matches the ledger history.
   * @param {string} walletId
   * @param {Object} tx
   */
  async calculateRunningBalance(walletId, tx) {
    const history = await ledgerRepository.getBalanceHistory(walletId, tx);
    let runningBalance = new Prisma.Decimal(0.0);

    for (const entry of history) {
      const amt = new Prisma.Decimal(entry.amount);
      if (entry.entryType === "CREDIT") {
        runningBalance = runningBalance.plus(amt);
      } else {
        runningBalance = runningBalance.minus(amt);
      }
    }

    return runningBalance;
  }
}

module.exports = new LedgerService();
