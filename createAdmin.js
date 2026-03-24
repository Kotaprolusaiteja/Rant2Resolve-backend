require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Rant2Resolve';

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Admin credentials
    const adminData = {
      name: 'Admin',
      email: 'admin@rant2resolve.com',
      password: 'admin123',
      role: 'ADMIN',
      department: 'Administration'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists!');
      console.log('Email:', adminData.email);
      console.log('You can use this account to login.');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    const admin = new User({
      ...adminData,
      password: hashedPassword
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('==========================================');
    console.log('Admin Login Credentials:');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('==========================================');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
