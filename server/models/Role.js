const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.model('Role', roleSchema);
