const ledgerRepository = require("../repositories/ledger.repository");

class LedgerController {
  async getWalletLedger(req, res, next) {
    try {
      // Admin provides walletId via query or params, or we can list all?
      // The requirement says: GET /ledger -> Fetch comprehensive balance logs
      // Let's assume they pass ?walletId=xxx
      const { walletId } = req.query;
      let logs;
      
      if (walletId) {
        logs = await ledgerRepository.findLedgerByWallet(walletId);
      } else {
        // Fetch all (mock implementation for "all logs" if needed)
        // Usually you'd paginate through all ledger entries
        const prisma = require("../lib/prisma");
        logs = await prisma.ledgerEntry.findMany({ orderBy: { createdAt: "desc" }});
      }
      
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionLedgerEntries(req, res, next) {
    try {
      // GET /ledger/:transactionRef
      const prisma = require("../lib/prisma");
      const { transactionRef } = req.params;
      
      // Find transaction by ref first to get its ID
      const tx = await prisma.transaction.findUnique({ where: { transactionRef } });
      if (!tx) {
        return res.status(404).json({ success: false, message: "Transaction not found" });
      }

      const entries = await prisma.ledgerEntry.findMany({
        where: { transactionId: tx.id },
      });

      res.status(200).json({ success: true, data: entries });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LedgerController();
