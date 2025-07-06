/**
 * Interactive script to create an admin user with custom password
 * Run with: node scripts/create-admin-interactive.js
 */

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function askPassword(question) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.resume();
    stdin.setEncoding('utf8');
    
    process.stdout.write(question);
    stdin.setRawMode(true);
    
    let password = '';
    
    stdin.on('data', function(char) {
      char = char + '';
      
      switch(char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.setRawMode(false);
          stdin.pause();
          console.log('');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function createAdminUserInteractive() {
  try {
    console.log('🔐 Admin User Creation Wizard');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Get admin details
    const email = await askQuestion('📧 Admin Email (default: admin@veezet.com): ') || 'admin@veezet.com';
    const name = await askQuestion('👤 Admin Name (default: Admin User): ') || 'Admin User';
    
    let password;
    let confirmPassword;
    
    do {
      password = await askPassword('🔒 Admin Password (minimum 8 characters): ');
      
      if (password.length < 8) {
        console.log('❌ Password must be at least 8 characters long. Please try again.\n');
        continue;
      }
      
      confirmPassword = await askPassword('🔒 Confirm Password: ');
      
      if (password !== confirmPassword) {
        console.log('❌ Passwords do not match. Please try again.\n');
      }
    } while (password !== confirmPassword || password.length < 8);

    console.log('\n🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('💾 Creating admin user...');
    const adminUser = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        password: hashedPassword,
        role: 'ADMIN',
        updatedAt: new Date(),
      },
      create: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', adminUser.name);
    console.log('🔑 Role:', adminUser.role);
    console.log('🆔 ID:', adminUser.id);
    console.log('⏰ Created:', adminUser.createdAt.toISOString());
    
    console.log('\n🚀 Admin user is ready to use!');
    console.log('🌐 You can now access the admin panel at: /admin');
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    
    if (error.code === 'P2002') {
      console.log('\n📝 Note: An admin user with this email already exists.');
    }
  } finally {
    await prisma.$disconnect();
    rl.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the script
createAdminUserInteractive();
