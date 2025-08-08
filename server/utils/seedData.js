const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Location = require('../models/Location');
const Equipment = require('../models/Equipment');

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@filmequipment.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    department: 'Management',
    phone: '+49123456789'
  },
  {
    username: 'staff1',
    email: 'staff1@filmequipment.com',
    password: 'staff123',
    firstName: 'Max',
    lastName: 'Mustermann',
    role: 'staff',
    department: 'Equipment Management',
    phone: '+49123456790'
  },
  {
    username: 'staff2',
    email: 'staff2@filmequipment.com',
    password: 'staff123',
    firstName: 'Anna',
    lastName: 'Schmidt',
    role: 'staff',
    department: 'Equipment Management',
    phone: '+49123456791'
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    password: 'user123',
    firstName: 'Tom',
    lastName: 'Weber',
    role: 'external',
    department: 'Film Production',
    phone: '+49123456792'
  },
  {
    username: 'user2',
    email: 'user2@example.com',
    password: 'user123',
    firstName: 'Lisa',
    lastName: 'Müller',
    role: 'external',
    department: 'Photography',
    phone: '+49123456793'
  }
];

const sampleLocations = [
  {
    name: 'Hauptlager',
    type: 'warehouse',
    address: {
      street: 'Industriestraße 123',
      city: 'Berlin',
      state: 'Berlin',
      zipCode: '10115',
      country: 'Deutschland'
    },
    description: 'Hauptlager für Filmequipment',
    capacity: {
      total: 500,
      used: 0
    },
    contactPerson: {
      name: 'Max Mustermann',
      email: 'max@filmequipment.com',
      phone: '+49123456790'
    },
    accessHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '14:00', closed: false },
      sunday: { open: '', close: '', closed: true }
    },
    facilities: ['loading_dock', 'parking', 'security', 'climate_control', 'power_outlets'],
    security: {
      requiresKey: true,
      requiresCode: true,
      accessCode: '1234',
      securityNotes: 'Zugang nur für autorisierte Mitarbeiter'
    }
  },
  {
    name: 'Studio A',
    type: 'studio',
    address: {
      street: 'Filmstraße 45',
      city: 'München',
      state: 'Bayern',
      zipCode: '80331',
      country: 'Deutschland'
    },
    description: 'Professionelles Filmstudio',
    capacity: {
      total: 100,
      used: 0
    },
    contactPerson: {
      name: 'Anna Schmidt',
      email: 'anna@filmequipment.com',
      phone: '+49123456791'
    },
    accessHours: {
      monday: { open: '09:00', close: '20:00', closed: false },
      tuesday: { open: '09:00', close: '20:00', closed: false },
      wednesday: { open: '09:00', close: '20:00', closed: false },
      thursday: { open: '09:00', close: '20:00', closed: false },
      friday: { open: '09:00', close: '20:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '', close: '', closed: true }
    },
    facilities: ['parking', 'security', 'climate_control', 'power_outlets', 'internet', 'bathroom', 'kitchen'],
    security: {
      requiresKey: true,
      requiresCode: false,
      securityNotes: 'Studio-Zugang über Haupteingang'
    }
  },
  {
    name: 'Büro',
    type: 'office',
    address: {
      street: 'Bürostraße 78',
      city: 'Hamburg',
      state: 'Hamburg',
      zipCode: '20095',
      country: 'Deutschland'
    },
    description: 'Hauptbüro und Verwaltung',
    capacity: {
      total: 50,
      used: 0
    },
    contactPerson: {
      name: 'Admin User',
      email: 'admin@filmequipment.com',
      phone: '+49123456789'
    },
    accessHours: {
      monday: { open: '08:00', close: '17:00', closed: false },
      tuesday: { open: '08:00', close: '17:00', closed: false },
      wednesday: { open: '08:00', close: '17:00', closed: false },
      thursday: { open: '08:00', close: '17:00', closed: false },
      friday: { open: '08:00', close: '17:00', closed: false },
      saturday: { open: '', close: '', closed: true },
      sunday: { open: '', close: '', closed: true }
    },
    facilities: ['parking', 'security', 'internet', 'bathroom', 'kitchen', 'meeting_room'],
    security: {
      requiresKey: false,
      requiresCode: true,
      accessCode: '5678',
      securityNotes: 'Büro-Zugang über Empfang'
    }
  }
];

const sampleEquipment = [
  {
    name: 'Sony FX6 Kamera',
    category: 'camera',
    brand: 'Sony',
    model: 'FX6',
    serialNumber: 'SN001-FX6-2024',
    description: 'Professionelle Vollformat-Kinokamera mit 4K-Aufnahme',
    specifications: {
      'Sensor': 'Full-Frame 35.6 x 23.8mm',
      'Auflösung': '4K (3840 x 2160)',
      'Framerate': 'bis 120fps',
      'Anschlüsse': 'XLR, HDMI, SDI'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
        alt: 'Sony FX6 Kamera',
        isPrimary: true
      }
    ],
    status: 'available',
    purchaseDate: new Date('2024-01-15'),
    purchasePrice: 4500,
    currentValue: 4200,
    rentalRate: {
      daily: 150,
      weekly: 800,
      monthly: 2800
    },
    tags: ['4k', 'cinema', 'professional', 'full-frame']
  },
  {
    name: 'Canon RF 24-70mm f/2.8 Objektiv',
    category: 'lens',
    brand: 'Canon',
    model: 'RF 24-70mm f/2.8L IS USM',
    serialNumber: 'SN002-CAN-2024',
    description: 'Professionelles Zoom-Objektiv für Canon RF-Mount',
    specifications: {
      'Brennweite': '24-70mm',
      'Blende': 'f/2.8',
      'Filterdurchmesser': '82mm',
      'Gewicht': '900g'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1510127034890-ba275aee457f?w=400',
        alt: 'Canon RF 24-70mm Objektiv',
        isPrimary: true
      }
    ],
    status: 'available',
    purchaseDate: new Date('2024-02-01'),
    purchasePrice: 2800,
    currentValue: 2600,
    rentalRate: {
      daily: 80,
      weekly: 400,
      monthly: 1400
    },
    tags: ['zoom', 'professional', 'canon', 'rf-mount']
  },
  {
    name: 'Aputure 600d Pro LED-Licht',
    category: 'lighting',
    brand: 'Aputure',
    model: '600d Pro',
    serialNumber: 'SN003-APT-2024',
    description: 'Professionelles LED-Licht mit hoher Helligkeit',
    specifications: {
      'Leistung': '600W',
      'Helligkeit': 'bis 90.000 Lux',
      'Farbtemperatur': '2700K-6500K',
      'Anschlüsse': 'DMX, Bluetooth'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
        alt: 'Aputure 600d Pro LED-Licht',
        isPrimary: true
      }
    ],
    status: 'available',
    purchaseDate: new Date('2024-01-20'),
    purchasePrice: 1200,
    currentValue: 1100,
    rentalRate: {
      daily: 60,
      weekly: 300,
      monthly: 1000
    },
    tags: ['led', 'professional', 'bright', 'dmx']
  },
  {
    name: 'Sennheiser MKH 416 Mikrofon',
    category: 'audio',
    brand: 'Sennheiser',
    model: 'MKH 416-P48',
    serialNumber: 'SN004-SEN-2024',
    description: 'Professionelles Shotgun-Mikrofon für Filmaufnahmen',
    specifications: {
      'Typ': 'Shotgun',
      'Polarität': 'Superkardioid',
      'Frequenzgang': '40Hz-20kHz',
      'Phantom Power': '48V'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=400',
        alt: 'Sennheiser MKH 416 Mikrofon',
        isPrimary: true
      }
    ],
    status: 'available',
    purchaseDate: new Date('2024-02-10'),
    purchasePrice: 800,
    currentValue: 750,
    rentalRate: {
      daily: 40,
      weekly: 200,
      monthly: 700
    },
    tags: ['shotgun', 'professional', 'film', 'audio']
  },
  {
    name: 'Manfrotto MT055 Stativ',
    category: 'tripod',
    brand: 'Manfrotto',
    model: 'MT055XPRO3',
    serialNumber: 'SN005-MAN-2024',
    description: 'Robustes Kamerastativ für schwere Kameras',
    specifications: {
      'Max. Belastung': '15kg',
      'Höhe': '1.5-2.1m',
      'Gewicht': '3.2kg',
      'Material': 'Aluminium'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
        alt: 'Manfrotto MT055 Stativ',
        isPrimary: true
      }
    ],
    status: 'available',
    purchaseDate: new Date('2024-01-25'),
    purchasePrice: 400,
    currentValue: 380,
    rentalRate: {
      daily: 25,
      weekly: 120,
      monthly: 400
    },
    tags: ['stativ', 'robust', 'heavy-duty', 'professional']
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Location.deleteMany({});
    await Equipment.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`👤 Created user: ${user.username}`);
    }

    // Create locations
    const createdLocations = [];
    for (const locationData of sampleLocations) {
      const location = new Location({
        ...locationData,
        createdBy: createdUsers[0]._id // Admin user
      });
      await location.save();
      createdLocations.push(location);
      console.log(`📍 Created location: ${location.name}`);
    }

    // Create equipment
    for (const equipmentData of sampleEquipment) {
      const equipment = new Equipment({
        ...equipmentData,
        location: createdLocations[0]._id, // Main warehouse
        createdBy: createdUsers[1]._id // Staff user
      });
      await equipment.save();
      console.log(`🎥 Created equipment: ${equipment.name}`);
    }

    // Update location capacity
    for (const location of createdLocations) {
      await location.updateCapacityUsage();
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created ${createdUsers.length} users, ${createdLocations.length} locations, and ${sampleEquipment.length} equipment items`);

    // Display login credentials
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@filmequipment.com / admin123');
    console.log('Staff: staff1@filmequipment.com / staff123');
    console.log('User: user1@example.com / user123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/filmequipment')
    .then(() => {
      console.log('✅ Connected to MongoDB');
      return seedDatabase();
    })
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database connection error:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase, sampleUsers, sampleLocations, sampleEquipment };
