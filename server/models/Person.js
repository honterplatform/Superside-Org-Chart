const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, default: '' },
  seniority: { type: String, default: '' },
  region: { type: String, default: '' },
  role: { type: String, enum: ['manager', 'ic'], default: 'ic' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', default: null },
  secondaryManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', default: null },
  capabilities: [{ type: String }],
  status: { type: String, enum: ['active', 'new', 'leaving', 'planned'], default: 'active' },
  statusNote: { type: String, default: '' },
  notes: { type: String, default: '' },
  type: { type: String, enum: ['employee', 'freelancer', 'planned_role'], default: 'employee' },
  order: { type: Number, default: 0 },
  posX: { type: Number, default: null },
  posY: { type: Number, default: null }
}, { timestamps: true });

personSchema.index({ managerId: 1 });
personSchema.index({ name: 1 });
personSchema.index({ region: 1 });

module.exports = mongoose.model('Person', personSchema);
