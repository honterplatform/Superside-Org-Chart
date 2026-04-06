const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  targetType: { type: String, enum: ['person', 'account', 'assignment'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  changes: {
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed }
  },
  performedBy: { type: String, default: 'system' },
  timestamp: { type: Date, default: Date.now }
});

activityLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
