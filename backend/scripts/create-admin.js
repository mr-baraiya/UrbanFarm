const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.example' });

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get command-line arguments
    const email = process.argv[2] || 'admin1234@example.com';
    const password = process.argv[3] || 'admin123@3006Zela';
    const name = process.argv[4] || 'Admin User123';
    const username = process.argv[5] || 'admin1233';

    console.log(`Creating admin user: ${username}`);

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log(`❌ User with email ${email} already exists`);
      console.log(`   Username: ${existingEmail.username || 'N/A'}`);
      console.log(`   Role: ${existingEmail.role}`);
      
      // ✅ Option to update password for existing user
      console.log('\n🔄 Would you like to update the password?');
      console.log('   Run: node scripts/update-password.js ' + email + ' ' + password);
      
      await mongoose.disconnect();
      process.exit(1);
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log(`❌ Username "${username}" already exists`);
      console.log(`   Email: ${existingUsername.email}`);
      console.log(`   Role: ${existingUsername.role}`);
      await mongoose.disconnect();
      process.exit(1);
    }

    // ✅ Create user with plain password (model will hash it)
    const admin = await User.create({
      name,
      username,
      email,
      password: password, // ✅ Let the model hash it
      role: 'admin',
      location: {
        city: 'Rajkot',
        country: 'India',
      },
      gardeningLevel: 'advanced',
    });

    console.log('');
    console.log('========================================');
    console.log('✅ Admin user created successfully!');
    console.log('========================================');
    console.log(`   Name:     ${admin.name}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role:     ${admin.role}`);
    console.log('========================================');

    // ✅ Verify password works
    console.log('\n🔐 Verifying password...');
    const testMatch = await admin.matchPassword(password);
    console.log(`   Password verification: ${testMatch ? '✅ Success' : '❌ Failed'}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

createAdmin();