const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const existingAdmin = await Admin.findOne({ email: 'admin@cms.com' });
    if (existingAdmin) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    await Admin.create({
      email: 'admin@cms.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Admin created successfully.');
    console.log('Email: admin@cms.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
