const express = require("express");
const router = express.Router();
const auditRepository = require("../../repositories/audit.repository");
const { authenticate, authorize } = require("../../middlewares/auth");

// Apply auth to all routes, require ADMIN or AUDITOR role
router.use(authenticate);
router.use(authorize("ADMIN", "AUDITOR"));

// GET /audit - Fetch all data mutation logs
router.get("/", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const audits = await auditRepository.listAudits(limit, offset);
    res.json({ success: true, data: audits });
  } catch (error) {
    next(error);
  }
});

// GET /audit/user/:id - Track specific consumer action history
router.get("/user/:id", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const audits = await auditRepository.findByUser(
      req.params.id,
      limit,
      offset,
    );
    res.json({ success: true, data: audits });
  } catch (error) {
    next(error);
  }
});

// GET /audit/entity/:entity - Monitor structural model updates
router.get("/entity/:entity", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const audits = await auditRepository.findByEntity(
      req.params.entity,
      limit,
      offset,
    );
    res.json({ success: true, data: audits });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
