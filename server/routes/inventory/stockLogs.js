const router = require('express').Router();
const StockLog = require('../../models/StockLog');
const { auth } = require('../../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { item, limit = 50, page = 1 } = req.query;
    let query = {};
    if (item) query.item = item;
    const logs = await StockLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    const total = await StockLog.countDocuments(query);
    res.json({ logs, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
