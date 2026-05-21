const router = require('express').Router();
const Item = require('../../models/Item');
const StockLog = require('../../models/StockLog');
const MaintenanceLog = require('../../models/MaintenanceLog');
const { auth, adminOnly, managerOrAdmin } = require('../../middleware/auth');
const { v4: uuidv4 } = require('uuid');



// Dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const items = await Item.find({}, 'quantity lowStockThreshold');
    const lowStock = items.filter(i => i.quantity <= i.lowStockThreshold).length;
const openMaintenance = await MaintenanceLog.countDocuments({ status: { $ne: 'Completed' } });
    const thisMonthUsage = await StockLog.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lte: new Date()
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
      // Priority items (top 3 low stock + maintenance)
      const priorityItemsRaw = await Item.find({ isLowStock: true }).sort({ quantity: 1 }).limit(2).lean();
      const maintenanceItemsRaw = await MaintenanceLog.find({ status: { $ne: 'Completed' } }).populate('item', 'name').sort({ createdAt: -1 }).limit(1).lean();
      const priorityItems = [
        ...priorityItemsRaw.map(i => ({
          name: i.name,
          status: 'Low Stock',
          priority: 'High'
        })),
        ...(maintenanceItemsRaw.map(l => ({
          name: l.item ? l.item.name : l.itemName,
          status: 'Maintenance Due',
          priority: 'Medium'
        })) || [])
      ].slice(0, 3);

      res.json({ 
        totalItems, 
        lowStock, 
        openMaintenance, 
        thisMonthUsage: thisMonthUsage[0]?.total || 0,
        priorityItems
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Get all items (lightweight for map/audit)
router.get('/all-light', auth, async (req, res) => {
  try {
    const items = await Item.find({})
      .select('-warrantyCardImage -warrantyCard -invoiceDocument -imageUrl -description')
      .sort({ createdAt: -1 })
      .lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all items
router.get('/', auth, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 24 } = req.query;
    let query = {};
    if (category) query.category = category;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const items = await Item.find(query)
      .select('-warrantyCardImage -warrantyCard -invoiceDocument')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
      
    const total = await Item.countDocuments(query);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Get single item by barcode/SKU
router.get('/barcode/:barcode', auth, async (req, res) => {
  try {
    const item = await Item.findOne({ 
      $or: [
        { barcode: req.params.barcode },
        { sku: req.params.barcode }
      ]
    });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get single item
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create item (all levels)
router.post('/', auth, async (req, res) => {
  try {
    const data = req.body;
    if (!data.sku) data.sku = `SKU-${Date.now()}`;
    if (!data.barcode) data.barcode = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
    const item = new Item(data);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update item (all levels)
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete item (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Stock adjustment
router.post('/:id/adjust', auth, async (req, res) => {
  try {
    const { action, quantity, reason, notes } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    const previousQty = item.quantity;
    if (action === 'Increase') {
      item.quantity += Number(quantity);
    } else {
      if (item.quantity < quantity) return res.status(400).json({ message: 'Insufficient quantity' });
      item.quantity -= Number(quantity);
    }
    await item.save();
    
    const log = new StockLog({
      item: item._id,
      itemName: item.name,
      action,
      quantity: Number(quantity),
      reason,
      previousQty,
      newQty: item.quantity,
      notes,
      user: req.user.id,
      userName: req.user.name
    });
    await log.save();
    
    res.json({ item, log });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Allocate stock to multiple locations
router.post('/:id/allocate', auth, async (req, res) => {
  try {
    const { allocations } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    const totalAllocated = allocations.reduce((acc, curr) => acc + Number(curr.quantity), 0);
    if (totalAllocated > item.quantity) {
      return res.status(400).json({ message: 'Cannot allocate more than total quantity' });
    }
    
    item.allocations = allocations;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
