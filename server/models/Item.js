const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  sku: { type: String, unique: true, sparse: true, index: true },
  barcode: { type: String, unique: true, sparse: true, index: true },
  category: { type: String, required: true, index: true },
  location: { type: String },
  allocations: [{
    location: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  quantity: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  model: { type: String },
  warrantyAvailable: { type: Boolean, default: false },
  warrantyExpiry: { type: Date },
  warrantyCardImage: { type: String },
  warrantyCard: { type: String },
  invoiceDocument: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  purchasedFrom: { type: String },
  shopAddress: { type: String },
  shopContact: { type: String }
}, { timestamps: true });

itemSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.lowStockThreshold;
});

module.exports = mongoose.model('Item', itemSchema);
