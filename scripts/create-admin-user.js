/**
 * Script to create an admin user
 * Run with: node scripts/create-admin-user.js
 */

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Configuration
    const adminEmail = 'admin@veezet.com';
    const adminPassword = 'admin123'; // Change this to a secure password
    const adminName = 'Admin User';

    // Hash the password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create or update admin user
    console.log('Creating admin user...');
    const adminUser = await prisma.user.upsert({
      where: {
        email: adminEmail,
      },
      update: {
        name: adminName,
        password: hashedPassword,
        role: 'ADMIN',
        updatedAt: new Date(),
      },
      create: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', adminUser.name);
    console.log('🔑 Role:', adminUser.role);
    console.log('🆔 ID:', adminUser.id);
    console.log('⏰ Created:', adminUser.createdAt);
    
    console.log('\n🚀 You can now login with:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n⚠️  Remember to change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 'P2002') {
      console.log('📝 Note: Admin user already exists. Use the update option if needed.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser();
