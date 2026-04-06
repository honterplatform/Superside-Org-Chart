const mongoose = require('mongoose');

const seniorityLevelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  rank: { type: Number, required: true },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.model('SeniorityLevel', seniorityLevelSchema);
