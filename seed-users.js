const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: './atlas.env' });
dotenv.config();

async function seedUsers() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set!');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Read users data from JSON file
    const usersData = JSON.parse(fs.readFileSync('./users-data.json', 'utf8'));
    
    // Combine all users
    const allUsers = [
      {
        username: usersData.admin.username,
        password: usersData.admin.password,
        name: usersData.admin.name,
        role: usersData.admin.role
      },
      ...usersData.users.map(u => ({
        username: u.username,
        password: u.password,
        name: u.name,
        role: u.role
      })),
      ...usersData.customers.map(c => ({
        username: c.username,
        password: c.password,
        name: c.name,
        role: c.role
      }))
    ];
    
    console.log(`📊 Found ${allUsers.length} users to seed:`);
    console.log(`   - 1 Admin user`);
    console.log(`   - ${usersData.users.length} Regular users`);
    console.log(`   - ${usersData.customers.length} Customer users`);
    
    // Seed users
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const userData of allUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      
      if (!existingUser) {
        const user = new User({
          username: userData.username,
          password: userData.password,
          name: userData.name,
          role: userData.role
        });
        
        await user.save();
        console.log(`   ✅ Created: ${userData.username} (${userData.name}) - ${userData.role}`);
        createdCount++;
      } else {
        console.log(`   ⏭️  Skipped: ${userData.username} (already exists)`);
        skippedCount++;
      }
    }
    
    console.log('\n📈 Summary:');
    console.log(`   ✅ Created: ${createdCount} users`);
    console.log(`   ⏭️  Skipped: ${skippedCount} users`);
    console.log(`   📊 Total: ${allUsers.length} users`);
    
    await mongoose.connection.close();
    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed function
seedUsers();

