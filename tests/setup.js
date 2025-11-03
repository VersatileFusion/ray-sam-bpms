const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './atlas.envv' });

// Setup before all tests
beforeAll(async () => {
  // Use real MongoDB with test database name
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    // Replace database name in Atlas URI
    // From: mongodb+srv://...cluster0.x5wnapy.mongodb.net/?...
    // To:   mongodb+srv://...cluster0.x5wnapy.mongodb.net/ray-sam-test?...
    const testUri = mongoUri.replace('@cluster0.x5wnapy.mongodb.net/?', '@cluster0.x5wnapy.mongodb.net/ray-sam-test?');
    
    console.log('🔄 Connecting to test database...');
    await mongoose.connect(testUri, {
      serverSelectionTimeoutMS: 30000
    });
    console.log('✅ Test database connected to ray-sam-test');
  } else {
    throw new Error('MONGODB_URI not found in environment variables');
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Drop the test database and disconnect
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    console.log('Test database disconnected');
  }
});

// Clean up collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (collections[key] && typeof collections[key].deleteMany === 'function') {
      await collections[key].deleteMany({}).catch(() => {});
    }
  }
});

