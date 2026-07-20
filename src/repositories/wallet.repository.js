const prisma = require("../lib/prisma");

async function createWallet(data, tx = prisma) {
  return tx.wallet.create({ data });
}

async function findWalletById(id, tx = prisma) {
  return tx.wallet.findUnique({ where: { id } });
}

async function findWalletByUserId(userId, tx = prisma) {
  return tx.wallet.findUnique({ where: { userId } });
}

async function findWalletByWalletNumber(walletNumber, tx = prisma) {
  return tx.wallet.findUnique({ where: { walletNumber } });
}

async function updateWalletStatus(id, status, tx = prisma) {
  return tx.wallet.update({
    where: { id },
    data: { status },
  });
}

async function updateWalletBalance(id, balance, tx = prisma) {
  return tx.wallet.update({
    where: { id },
    data: { balance },
  });
}

async function closeWallet(id, tx = prisma) {
  return tx.wallet.update({
    where: { id },
    data: { status: "CLOSED" },
  });
}

module.exports = {
  createWallet,
  findWalletById,
  findWalletByUserId,
  findWalletByWalletNumber,
  updateWalletStatus,
  updateWalletBalance,
  closeWallet,
};
