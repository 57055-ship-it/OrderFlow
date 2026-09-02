require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[MongoDB] Connected');

    const existingAdmin = await User.findOne({ role: 'ADMIN' });

    if (existingAdmin) {
      console.log(`[Admin] An Administrator already exists: ${existingAdmin.email}`);
      return;
    }

    const admin = await User.create({
      name: 'OrderFlow Administrator',
      email: 'admin@orderflow.com',
      password: 'Admin@123456',
      role: 'ADMIN',
      isActive: true
    });

    console.log('[Admin] Created successfully');
    console.log(`Email: ${admin.email}`);
    console.log('Password: Admin@123456');
  } catch (error) {
    console.error('[Admin] Creation failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
