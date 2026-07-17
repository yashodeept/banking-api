const prisma = require("../lib/prisma");

async function createWallet(data) {
  return prisma.wallet.create({ data });
}

async function findWalletById(id) {
  return prisma.wallet.findUnique({ where: { id } });
}

async function findWalletByUserId(userId) {
  return prisma.wallet.findUnique({ where: { userId } });
}

async function findWalletByWalletNumber(walletNumber) {
  return prisma.wallet.findUnique({ where: { walletNumber } });
}

async function updateWalletStatus(id, status) {
  return prisma.wallet.update({
    where: { id },
    data: { status },
  });
}

async function updateWalletBalance(id, balance) {
  return prisma.wallet.update({
    where: { id },
    data: { balance },
  });
}

async function closeWallet(id) {
  return prisma.wallet.update({
    where: { id },
    data: { status: 'CLOSED' },
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
