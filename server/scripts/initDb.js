const mongoose = require('mongoose');
const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Location = require('../models/Location');
require('dotenv').config();

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/filmequipment';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Equipment.deleteMany({});
    await Location.deleteMany({});
    console.log('🗑️  Cleared existing data');



    // Create default users
    const users = await User.create([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        department: 'IT',
        phone: '+49123456789',
        isActive: true
      },
      {
        username: 'max.mustermann',
        email: 'max.mustermann@example.com',
        password: 'password123',
        firstName: 'Max',
        lastName: 'Mustermann',
        role: 'staff',
        department: 'Film Production',
        phone: '+49123456790',
        isActive: true
      },
      {
        username: 'anna.schmidt',
        email: 'anna.schmidt@example.com',
        password: 'password123',
        firstName: 'Anna',
        lastName: 'Schmidt',
        role: 'staff',
        department: 'Photography',
        phone: '+49123456791',
        isActive: true
      },
      {
        username: 'tom.weber',
        email: 'tom.weber@example.com',
        password: 'password123',
        firstName: 'Tom',
        lastName: 'Weber',
        role: 'external',
        department: 'Lighting',
        phone: '+49123456792',
        isActive: true
      }
    ]);
    console.log('👥 Created users');

    // Create default locations with createdBy field
    const locations = await Location.create([
      {
        name: 'Hauptlager',
        address: 'Musterstraße 123, 12345 Musterstadt',
        description: 'Hauptlager für Film-Equipment',
        contactPerson: 'Max Mustermann',
        phone: '+49123456789',
        email: 'lager@filmequipment.de',
        createdBy: users[0]._id // Admin user
      },
      {
        name: 'Studio A',
        address: 'Studioweg 456, 12345 Musterstadt',
        description: 'Hauptstudio für Filmproduktionen',
        contactPerson: 'Anna Schmidt',
        phone: '+49123456790',
        email: 'studio@filmequipment.de',
        createdBy: users[0]._id // Admin user
      },
      {
        name: 'Lichtlager',
        address: 'Lichtstraße 789, 12345 Musterstadt',
        description: 'Spezialisiert auf Beleuchtungsequipment',
        contactPerson: 'Tom Weber',
        phone: '+49 123 456791',
        email: 'licht@filmequipment.de',
        createdBy: users[0]._id // Admin user
      }
    ]);
    console.log('📍 Created locations');

    // Create sample equipment
    const equipment = await Equipment.create([
      {
        name: 'Sony FX3 Kamera',
        category: 'camera',
        brand: 'Sony',
        model: 'FX3',
        serialNumber: 'SN001',
        description: 'Professionelle Vollformat-Kamera für Filmproduktionen',
        location: locations[0]._id, // Hauptlager
        createdBy: users[0]._id, // Admin user
        status: 'available',
        condition: 'excellent',
        purchasePrice: 4500,
        currentValue: 4200,
        rentalRate: {
          daily: 150,
          weekly: 900,
          monthly: 3000
        },
        images: [
          {
            url: 'https://via.placeholder.com/300x200?text=Sony+FX3',
            isPrimary: true,
            alt: 'Sony FX3 Camera'
          }
        ]
      },
      {
        name: 'Canon 24-70mm Objektiv',
        category: 'lens',
        brand: 'Canon',
        model: '24-70mm f/2.8L',
        serialNumber: 'SN002',
        description: 'Professionelles Zoom-Objektiv für Canon EOS',
        location: locations[0]._id, // Hauptlager
        createdBy: users[0]._id, // Admin user
        status: 'available',
        condition: 'excellent',
        purchasePrice: 1800,
        currentValue: 1700,
        rentalRate: {
          daily: 80,
          weekly: 480,
          monthly: 1600
        },
        images: [
          {
            url: 'https://via.placeholder.com/300x200?text=Canon+24-70mm',
            isPrimary: true,
            alt: 'Canon 24-70mm Lens'
          }
        ]
      },
      {
        name: 'ARRI SkyPanel S60-C',
        category: 'lighting',
        brand: 'ARRI',
        model: 'SkyPanel S60-C',
        serialNumber: 'SN003',
        description: 'Professionelle LED-Beleuchtung für Filmproduktionen',
        location: locations[2]._id, // Lichtlager
        createdBy: users[0]._id, // Admin user
        status: 'available',
        condition: 'excellent',
        purchasePrice: 3500,
        currentValue: 3300,
        rentalRate: {
          daily: 200,
          weekly: 1200,
          monthly: 4000
        },
        images: [
          {
            url: 'https://via.placeholder.com/300x200?text=ARRI+SkyPanel',
            isPrimary: true,
            alt: 'ARRI SkyPanel'
          }
        ]
      },
      {
        name: 'Sennheiser MKH 416 Mikrofon',
        category: 'audio',
        brand: 'Sennheiser',
        model: 'MKH 416',
        serialNumber: 'SN004',
        description: 'Professionelles Shotgun-Mikrofon für Filmaufnahmen',
        location: locations[0]._id, // Hauptlager
        createdBy: users[0]._id, // Admin user
        status: 'available',
        condition: 'excellent',
        purchasePrice: 1200,
        currentValue: 1100,
        rentalRate: {
          daily: 60,
          weekly: 360,
          monthly: 1200
        },
        images: [
          {
            url: 'https://via.placeholder.com/300x200?text=Sennheiser+MKH416',
            isPrimary: true,
            alt: 'Sennheiser MKH 416'
          }
        ]
      },
      {
        name: 'Manfrotto MT055 Tripod',
        category: 'tripod',
        brand: 'Manfrotto',
        model: 'MT055',
        serialNumber: 'SN005',
        description: 'Robustes Stativ für schwere Kameras',
        location: locations[0]._id, // Hauptlager
        createdBy: users[0]._id, // Admin user
        status: 'available',
        condition: 'good',
        purchasePrice: 800,
        currentValue: 700,
        rentalRate: {
          daily: 40,
          weekly: 240,
          monthly: 800
        },
        images: [
          {
            url: 'https://via.placeholder.com/300x200?text=Manfrotto+Tripod',
            isPrimary: true,
            alt: 'Manfrotto Tripod'
          }
        ]
      }
    ]);
    console.log('📹 Created equipment');

    console.log('\n🎉 Database initialized successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('👤 Admin: admin@example.com / password123');
    console.log('👤 Staff: max.mustermann@example.com / password123');
    console.log('👤 Staff: anna.schmidt@example.com / password123');
    console.log('👤 External: tom.weber@example.com / password123');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the initialization
initializeDatabase();
