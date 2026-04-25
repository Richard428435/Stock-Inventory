const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const { Ministry, Wing } = require('../models/MinistryWing');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Seed overall administrator
    const adminEmail = 'cffachurchcoimbatore@gmail.com'.toLowerCase();
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      await User.create({ 
        name: 'CFFA Admin', 
        email: adminEmail, 
        password: 'Jai171065', 
        role: 'admin',
        active: true 
      });
      console.log('✅ CFFA Admin created');
    } else {
      // Update existing admin account to ensure the password is set as requested
      existing.name = 'CFFA Admin';
      existing.password = 'Jai171065';
      existing.role = 'admin';
      existing.active = true;
      await existing.save();
      console.log('ℹ️  CFFA Admin credentials updated');
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
