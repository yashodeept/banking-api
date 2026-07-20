const prisma = require("../config/database");

class PaymentRepository {
  async createPayment(data, prismaClient = prisma) {
    return await prismaClient.payment.create({
      data,
    });
  }

  async findByReference(paymentRef) {
    return await prisma.payment.findUnique({
      where: { paymentRef },
      include: { transaction: true },
    });
  }

  async findByIdempotencyKey(idempotencyKey) {
    return await prisma.payment.findUnique({
      where: { idempotencyKey },
    });
  }

  async updateStatus(id, status, prismaClient = prisma) {
    return await prismaClient.payment.update({
      where: { id },
      data: { status },
    });
  }

  async updateGatewayResponse(id, gatewayResponse, prismaClient = prisma) {
    return await prismaClient.payment.update({
      where: { id },
      data: { gatewayResponse },
    });
  }

  async findPaymentsByUser(userId) {
    return await prisma.payment.findMany({
      where: {
        transaction: {
          createdBy: userId,
        },
      },
      include: {
        transaction: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

module.exports = new PaymentRepository();
