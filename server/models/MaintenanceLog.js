const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName: { type: String },
  type: { type: String, enum: ['Repair', 'Service', 'Inspection', 'Replacement'], required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  description: { type: String },
  technician: { type: String },
  cost: { type: Number },
  scheduledDate: { type: Date },
  completedDate: { type: Date },
  notes: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String }
}, { timestamps: true });

maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ createdAt: -1 });
maintenanceSchema.index({ item: 1 });

module.exports = mongoose.model('MaintenanceLog', maintenanceSchema);
