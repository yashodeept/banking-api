const prisma = require("../../lib/prisma");

/**
 * Appends a new entry to the immutable ledger.
 * @param {Object} data - Ledger entry data.
 * @param {Object} tx - Optional Prisma transaction client.
 */
async function createLedgerEntry(data, tx = prisma) {
  return tx.ledgerEntry.create({ data });
}

/**
 * Fetches the ledger history for a specific wallet.
 * @param {string} walletId - Wallet ID.
 * @param {Object} tx - Optional Prisma transaction client.
 */
async function findLedgerByWallet(walletId, tx = prisma) {
  return tx.ledgerEntry.findMany({
    where: { walletId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Recalculates balance directly from ledger entries to verify the cache.
 * @param {string} walletId - Wallet ID.
 * @param {Object} tx - Optional Prisma transaction client.
 */
async function getBalanceHistory(walletId, tx = prisma) {
  // Simplistic approach to aggregate credit minus debit, but usually
  // you just query the ledger entries to re-aggregate if needed.
  // For now, we return the ledger entries which represent history.
  return tx.ledgerEntry.findMany({
    where: { walletId },
    orderBy: { createdAt: "asc" },
  });
}

module.exports = {
  createLedgerEntry,
  findLedgerByWallet,
  getBalanceHistory,
};
