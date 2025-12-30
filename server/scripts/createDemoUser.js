const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-path-generator', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Delete existing demo user if exists
    await User.deleteOne({ email: 'demo@example.com' });
    console.log('Removed existing demo user (if any)');
    
    // Create fresh demo user
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'demo123' // Will be hashed by pre-save hook
    });
    
    console.log('✅ Demo user created successfully');
    console.log('Demo user details:');
    console.log('Email:', demoUser.email);
    console.log('Name:', demoUser.name);
    
    // Verify password - need to select password field
    const userWithPassword = await User.findOne({ email: 'demo@example.com' }).select('+password');
    if (userWithPassword) {
      const isValid = await bcrypt.compare('demo123', userWithPassword.password);
      console.log('Password verification:', isValid ? '✅ Valid' : '❌ Invalid');
      if (!isValid) {
        console.error('⚠️ Password verification failed!');
      }
    } else {
      console.error('⚠️ Could not find user with password field');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

