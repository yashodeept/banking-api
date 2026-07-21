const prisma = require("../../shared/config/env");

class AuditRepository {
  async createAudit(data, prismaClient = prisma) {
    return await prismaClient.auditLog.create({
      data,
    });
  }

  async listAudits(limit = 100, offset = 0) {
    return await prisma.auditLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  }

  async findByEntity(entity, limit = 100, offset = 0) {
    return await prisma.auditLog.findMany({
      where: { entity },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  }

  async findByUser(userId, limit = 100, offset = 0) {
    return await prisma.auditLog.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
  }
}

module.exports = new AuditRepository();
