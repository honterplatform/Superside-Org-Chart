const mongoose = require('mongoose');

const freelancePoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  members: [{
    name: { type: String, required: true },
    specialty: { type: String, default: '' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('FreelancePool', freelancePoolSchema);
