require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Plan = require('../models/Plan');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Create Admin User
    const adminExists = await User.findOne({ email: 'admin@montrevaltrustholding.com' });
    if (!adminExists) {
      const admin = await User.create({
        email: 'admin@montrevaltrustholding.com',
        password: 'Admin@123456',
        fullName: 'System Administrator',
        role: 'admin',
        emailVerified: true
      });
      console.log('✅ Admin user created:', admin.email);
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create Default Plans
    const plansExist = await Plan.countDocuments();
    if (plansExist === 0) {
      const defaultPlans = [
        {
          name: 'Starter',
          price: 49,
          processingTime: 'Standard 7-10 day processing',
          features: [
            '100% accuracy guarantee',
            'Name availability check',
            'Articles of Organization',
            'Digital document delivery',
            'Basic support'
          ],
          isActive: true,
          description: 'Perfect for simple crypto LLC formation'
        },
        {
          name: 'Pro',
          price: 149,
          processingTime: 'Fastest 1-day processing',
          features: [
            'Fastest 1-day processing',
            '100% accuracy guarantee',
            'Ongoing filing compliance (state-required)',
            'Employer ID Number (EIN)',
            'Operating agreement template',
            'Business logo builder',
            'Priority support',
            'Crypto-friendly banking intro'
          ],
          isActive: true,
          recommended: true,
          description: 'Most popular for active crypto businesses'
        },
        {
          name: 'Premium',
          price: 299,
          processingTime: 'Priority 1-day processing',
          features: [
            'Everything in Pro',
            'Dedicated account manager',
            'Crypto wallet integration',
            'Annual report filing',
            'Registered agent service (1 year)',
            'Business license research',
            'Tax consultation introduction',
            '24/7 priority support'
          ],
          isActive: true,
          description: 'Complete solution for serious crypto entrepreneurs'
        }
      ];

      await Plan.insertMany(defaultPlans);
      console.log('✅ Default plans created: Starter, Pro, Premium');
    } else {
      console.log('✅ Plans already exist');
    }

    console.log('✅ Seeding completed successfully');
    console.log('-----------------------------------');
    console.log('Admin Login:');
    console.log('Email: admin@montrevaltrustholding.com');
    console.log('Password: Admin@123456');
    console.log('-----------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();