const transactionService = require("../services/transaction.service");
const walletRepository = require("../repositories/wallet.repository");
const NotFoundError = require("../errors/NotFoundError");

class TransactionController {
  async _getUserWalletId(userId) {
    const wallet = await walletRepository.findWalletByUserId(userId);
    if (!wallet) {
      throw new NotFoundError("Wallet not found for the current user");
    }
    return wallet.id;
  }

  async deposit(req, res, next) {
    try {
      const walletId = await this._getUserWalletId(req.user.id);
      const { amount, description } = req.body;
      
      const transaction = await transactionService.deposit(walletId, amount, req.user.id, description);
      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  }

  async withdraw(req, res, next) {
    try {
      const walletId = await this._getUserWalletId(req.user.id);
      const { amount, description } = req.body;
      
      const transaction = await transactionService.withdraw(walletId, amount, req.user.id, description);
      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  }

  async transfer(req, res, next) {
    try {
      const senderWalletId = await this._getUserWalletId(req.user.id);
      const { receiverWalletId, amount, description } = req.body;
      
      const transaction = await transactionService.transfer(
        senderWalletId, 
        receiverWalletId, 
        amount, 
        req.user.id, 
        description
      );
      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const walletId = await this._getUserWalletId(req.user.id);
      const transactions = await transactionService.getTransactionHistory(walletId);
      res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionDetails(req, res, next) {
    try {
      const transaction = await transactionService.getTransactionDetails(req.params.reference);
      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransactionController();
