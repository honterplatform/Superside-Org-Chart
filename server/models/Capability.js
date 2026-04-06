const mongoose = require('mongoose');

const capabilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, default: '' },
  color: { type: String, default: '#666666' },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.model('Capability', capabilitySchema);
