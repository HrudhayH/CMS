const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function createSecondSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await Admin.findOne({ email: 'admin2@cms.com' });
    if (existing) {
      console.log('Admin already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    const admin = new Admin({
      name: 'Super Admin 2',
      email: 'admin2@cms.com',
      password: 'admin1234',
      role: 'super_admin'
    });

    await admin.save();

    console.log('Super Admin 2 Created');
    console.log('Email: admin2@cms.com');
    console.log('Password: admin1234');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createSecondSuperAdmin();
