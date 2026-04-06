const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  priority: { type: String, enum: ['main', 'secondary', 'additional'], default: 'main' },
  modifier: { type: String, enum: [null, 'temporary', 'if_time_allows'], default: null },
  order: { type: Number, default: 0 }
}, { timestamps: true });

assignmentSchema.index({ personId: 1 });
assignmentSchema.index({ accountId: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
