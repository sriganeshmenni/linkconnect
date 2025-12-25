require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/database');

(async () => {
  try {
    await connectDB();
    const email = process.env.ADMIN_EMAIL || 'admin@linkconnect.test';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const name = process.env.ADMIN_NAME || 'Super Admin';

    const hash = await bcrypt.hash(password, 12);

    const result = await User.updateOne(
      { email, role: 'admin' },
      {
        $set: {
          name,
          email,
          role: 'admin',
          password: hash,
          active: true,
          tokenVersion: 0,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log('Admin created:', email, 'password:', password);
    } else {
      console.log('Admin reset:', email, 'password:', password);
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed admin error', err);
    process.exit(1);
  }
})();
