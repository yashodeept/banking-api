const walletRepository = require("../repositories/wallet.repository");
const userRepository = require("../repositories/user.repository");
const crypto = require("crypto");
const ConflictError = require("../errors/ConflictError");
const NotFoundError = require("../errors/NotFoundError");
const BadRequestError = require("../errors/BadRequestError");

class WalletService {
  async createWallet(userId, currency = "INR") {
    // Check if user exists
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Enforce that a user can own a maximum of one active wallet instance
    const existingWallet = await walletRepository.findWalletByUserId(userId);
    if (existingWallet && existingWallet.status !== "CLOSED") {
      throw new ConflictError("User already has an active wallet");
    }

    // Generate cryptographic, unalterable wallet number identifier
    const walletNumber = this._generateWalletNumber();

    const newWallet = await walletRepository.createWallet({
      userId,
      walletNumber,
      currency,
    });

    return newWallet;
  }

  async getWalletDetails(userId) {
    const wallet = await walletRepository.findWalletByUserId(userId);
    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }
    return wallet;
  }

  async freezeWallet(walletId) {
    const wallet = await walletRepository.findWalletById(walletId);
    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }
    if (wallet.status === "CLOSED") {
      throw new BadRequestError("Cannot freeze a closed wallet");
    }
    return walletRepository.updateWalletStatus(walletId, "FROZEN");
  }

  async unfreezeWallet(walletId) {
    const wallet = await walletRepository.findWalletById(walletId);
    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }
    // Enforce that wallets in a CLOSED state cannot be reopened
    if (wallet.status === "CLOSED") {
      throw new BadRequestError(
        "Cannot unfreeze a closed wallet. Closed wallets cannot be reopened.",
      );
    }
    return walletRepository.updateWalletStatus(walletId, "ACTIVE");
  }

  async closeWallet(walletId) {
    const wallet = await walletRepository.findWalletById(walletId);
    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }
    if (wallet.status === "CLOSED") {
      throw new BadRequestError("Wallet is already closed");
    }
    return walletRepository.closeWallet(walletId);
  }

  _generateWalletNumber() {
    // Generate a secure random string (e.g., 16 uppercase hex chars)
    return crypto.randomBytes(8).toString("hex").toUpperCase();
  }
}

module.exports = new WalletService();
