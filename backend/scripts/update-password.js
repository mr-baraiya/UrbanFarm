const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updatePassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log('❌ Usage: node update-password.js email@example.com newpassword');
      process.exit(1);
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`🔄 Updating password for: ${email}`);
    
    // ✅ Update password directly (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    console.log(`✅ Password updated for ${email}`);
    
    // Verify the new password
    const testMatch = await user.matchPassword(newPassword);
    console.log(`   Password verification: ${testMatch ? '✅ Success' : '❌ Failed'}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updatePassword();