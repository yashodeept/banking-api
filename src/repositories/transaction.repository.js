const prisma = require("../lib/prisma");

/**
 * Creates a new transaction record.
 * @param {Object} data - Transaction data.
 * @param {Object} tx - Optional Prisma transaction client.
 */
async function createTransaction(data, tx = prisma) {
  return tx.transaction.create({ data });
}

/**
 * Finds a transaction by its ID.
 * @param {string} id - Transaction ID.
 * @param {Object} tx - Optional Prisma transaction client.
 */
async function findTransactionById(id, tx = prisma) {
  return tx.transaction.findUnique({ where: { id } });
}

/**
 * Finds a transaction by its reference string.
 * @param {string} transactionRef - Transaction reference.
 * @param {Object} tx - Optional Prisma transaction client.
 */
async function findTransactionByReference(transactionRef, tx = prisma) {
  return tx.transaction.findUnique({ where: { transactionRef } });
}

/**
 * Fetches all transactions for a specific user (either sent or received).
 * @param {string} walletId - Wallet ID.
 * @param {Object} tx - Optional Prisma transaction client.
 */
async function findUserTransactions(walletId, tx = prisma) {
  return tx.transaction.findMany({
    where: {
      OR: [{ senderWalletId: walletId }, { receiverWalletId: walletId }],
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Updates the status of an existing transaction.
 * @param {string} id - Transaction ID.
 * @param {string} status - New status (e.g., SUCCESS, FAILED).
 * @param {Object} tx - Optional Prisma transaction client.
 */
async function updateTransactionStatus(id, status, tx = prisma) {
  return tx.transaction.update({
    where: { id },
    data: { status },
  });
}

module.exports = {
  createTransaction,
  findTransactionById,
  findTransactionByReference,
  findUserTransactions,
  updateTransactionStatus,
};
