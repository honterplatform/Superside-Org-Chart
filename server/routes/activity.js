const router = require('express').Router();
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res, next) => {
  try {
    const { targetType, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (targetType) filter.targetType = targetType;

    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ActivityLog.countDocuments(filter);
    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

module.exports = router;
