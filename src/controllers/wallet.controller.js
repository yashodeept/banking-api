const walletService = require("../services/wallet.service");

class WalletController {
  async createWallet(req, res, next) {
    try {
      const wallet = await walletService.createWallet(
        req.user.id,
        req.body.currency,
      );
      res.status(201).json({ success: true, data: wallet });
    } catch (error) {
      next(error);
    }
  }

  async getWallet(req, res, next) {
    try {
      const wallet = await walletService.getWalletDetails(req.user.id);
      res.status(200).json({ success: true, data: wallet });
    } catch (error) {
      next(error);
    }
  }

  async freezeWallet(req, res, next) {
    try {
      // Need a wallet ID, assume it's passed in body or assume freezing user's own wallet?
      // Wait, the routes in the instructions: PATCH /wallet/freeze -> (authorize('ADMIN'))
      // Admin should specify which wallet. Let's assume body contains walletId.
      const { walletId } = req.body;
      const wallet = await walletService.freezeWallet(walletId);
      res.status(200).json({ success: true, data: wallet });
    } catch (error) {
      next(error);
    }
  }

  async unfreezeWallet(req, res, next) {
    try {
      const { walletId } = req.body;
      const wallet = await walletService.unfreezeWallet(walletId);
      res.status(200).json({ success: true, data: wallet });
    } catch (error) {
      next(error);
    }
  }

  async closeWallet(req, res, next) {
    try {
      // Users can close their own wallet
      const userWallet = await walletService.getWalletDetails(req.user.id);
      const wallet = await walletService.closeWallet(userWallet.id);
      res.status(200).json({ success: true, data: wallet });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();
