const router = require('express').Router();
const Category = require('../../models/Category');
const Item = require('../../models/Item');
const { auth } = require('../../middleware/auth');

// Get all categories
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create category
router.post('/', auth, async (req, res) => {
  try {
    const category = new Category({ name: req.body.name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete category
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Optional: Check if any items are using this category
    const itemsUsing = await Item.findOne({ category: category.name });
    if (itemsUsing) {
      return res.status(400).json({ message: 'Cannot delete category while items are assigned to it' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
