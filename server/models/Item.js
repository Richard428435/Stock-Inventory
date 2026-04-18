const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true },
  barcode: { type: String, unique: true, sparse: true },
  category: { type: String, required: true },
  location: { type: String },
  quantity: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  model: { type: String },
  warrantyAvailable: { type: Boolean, default: false },
  warrantyExpiry: { type: Date },
  warrantyCardImage: { type: String },
  warrantyCard: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  purchasedFrom: { type: String },
  shopAddress: { type: String }
}, { timestamps: true });

itemSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.lowStockThreshold;
});

module.exports = mongoose.model('Item', itemSchema);
