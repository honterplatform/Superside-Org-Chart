const ActivityLog = require('../models/ActivityLog');

async function logActivity(action, targetType, targetId, changes = {}, performedBy = 'system') {
  try {
    await ActivityLog.create({
      action,
      targetType,
      targetId,
      changes,
      performedBy,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

module.exports = { logActivity };
