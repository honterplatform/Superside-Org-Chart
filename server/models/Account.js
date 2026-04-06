const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teamName: { type: String, default: '' },
  externalId: { type: String, default: '' },
  mrr: { type: Number, default: 0 },
  region: { type: String, default: '' },
  businessUnit: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  color: { type: String, default: '#666666' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

accountSchema.index({ region: 1 });

module.exports = mongoose.model('Account', accountSchema);
