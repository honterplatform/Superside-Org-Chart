const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.model('Region', regionSchema);
