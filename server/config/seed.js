const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const { Ministry, Wing } = require('../models/MinistryWing');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Seed admin
    const existing = await User.findOne({ email: 'admin@church.com' });
    if (!existing) {
      await User.create({ name: 'Admin', email: 'admin@church.com', password: 'admin123', role: 'admin' });
      console.log('✅ Admin user created: admin@church.com / admin123');
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // Seed default ministries
    const ministryNames = ['Youth Ministry', 'Choir Ministry', 'Prayer Ministry'];
    for (const name of ministryNames) {
      const exists = await Ministry.findOne({ name });
      if (!exists) await Ministry.create({ name });
    }
    console.log('✅ Default ministries seeded');

    // Seed default wings
    const wingNames = ["Men's Fellowship", "Women's Fellowship", "Children Ministry"];
    for (const name of wingNames) {
      const exists = await Wing.findOne({ name });
      if (!exists) await Wing.create({ name });
    }
    console.log('✅ Default wings seeded');

    console.log('\n🎉 Seed complete! You can now start the server.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
