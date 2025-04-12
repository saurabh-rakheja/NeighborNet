require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Admin = require('../src/models/adminSchema');

const createSuperAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected...');
    
    // Check if a superadmin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'superadmin' });
    
    if (existingSuperAdmin) {
      console.log('A superadmin account already exists.');
      process.exit(0);
    }
    
    // Create superadmin account
    const superAdmin = new Admin({
      name: 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@volunteermanagementsystem.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'password123', // Will be hashed by pre-save hook
      role: 'superadmin',
      department: 'Management',
      permissions: {
        manageUsers: true,
        manageNGOs: true,
        manageVolunteers: true,
        manageProjects: true,
        manageAdmins: true,
        systemSettings: true
      }
    });
    
    await superAdmin.save();
    
    console.log(`Superadmin created with email: ${superAdmin.email}`);
    console.log('Please change the password immediately after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating superadmin:', error);
    process.exit(1);
  }
};

createSuperAdmin(); 