import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@mobileshop.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@mobileshop.com',
      password: 'Admin@123',
      phone: '9999999999',
      role: 'admin',
      isActive: true,
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@mobileshop.com');
    console.log('🔑 Password: Admin@123');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();

// Made with Bob
