/**
 * Script to create an admin user
 * Run with: npx tsx scripts/create-admin-user.ts
 * Or: node -r ts-node/register scripts/create-admin-user.ts
 */

import bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

interface AdminConfig {
  email: string;
  password: string;
  name: string;
}

async function createAdminUser() {
  try {
    // Configuration - Change these values as needed
    const config: AdminConfig = {
      email: 'admin@veezet.com',
      password: 'admin123', // Change this to a secure password
      name: 'Admin User',
    };

    console.log('🔐 Creating admin user...');
    console.log(`📧 Email: ${config.email}`);

    // Hash the password
    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(config.password, 12);

    // Create or update admin user
    console.log('💾 Saving to database...');
    const adminUser = await prisma.user.upsert({
      where: {
        email: config.email,
      },
      update: {
        name: config.name,
        password: hashedPassword,
        role: UserRole.ADMIN,
        updatedAt: new Date(),
      },
      create: {
        name: config.name,
        email: config.email,
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', adminUser.name);
    console.log('🔑 Role:', adminUser.role);
    console.log('🆔 ID:', adminUser.id);
    console.log('⏰ Created:', adminUser.createdAt.toISOString());
    console.log('🔄 Updated:', adminUser.updatedAt.toISOString());
    
    console.log('\n🚀 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email: ${config.email}`);
    console.log(`   Password: ${config.password}`);
    
    console.log('\n⚠️  Security Recommendations:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('• Change the default password after first login');
    console.log('• Use a strong, unique password');
    console.log('• Enable two-factor authentication if available');
    console.log('• Regularly review admin access logs');

  } catch (error: any) {
    console.error('\n❌ Error creating admin user:', error.message);
    
    if (error.code === 'P2002') {
      console.log('\n📝 Note: An admin user with this email already exists.');
      console.log('   The script attempted to update the existing user.');
    } else if (error.code === 'P2025') {
      console.log('\n📝 Note: Database connection or model issue.');
      console.log('   Make sure your database is running and migrations are applied.');
    } else {
      console.error('Full error details:', error);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed.');
  }
}

// Handle script execution
if (require.main === module) {
  createAdminUser();
}

export { createAdminUser };
