const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName: { type: String },
  action: { type: String, enum: ['Increase', 'Decrease'], required: true },
  quantity: { type: Number, required: true },
  reason: { type: String, enum: ['Purchase', 'Usage', 'Damage', 'Transfer', 'Adjustment'], required: true },
  previousQty: { type: Number },
  newQty: { type: Number },
  notes: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String }
}, { timestamps: true });

stockLogSchema.index({ createdAt: -1 });
stockLogSchema.index({ item: 1 });

module.exports = mongoose.model('StockLog', stockLogSchema);
